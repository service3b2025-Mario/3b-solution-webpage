import { Express, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { COOKIE_NAME as SHARED_COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ENV } from "./env";
import { sendOTP, verifyOTP, getOTPEmail, getOTPConfig, testEmailConfiguration } from "./email-otp-service";
import { sendVisitorOTP, verifyVisitorOTP } from "./visitor-email-otp-service";
import { getDb } from "../db";
import { adminUsers, visitors, users } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";

// Re-export COOKIE_NAME for other files that import from oauth
export const COOKIE_NAME = SHARED_COOKIE_NAME;

// ============================================
// SECURITY CONFIGURATION
// ============================================
const SECURITY_CONFIG = {
  // Rate limiting: max login attempts per IP
  maxLoginAttemptsPerIP: 5,
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  
  // Session duration
  sessionDurationMs: 8 * 60 * 60 * 1000, // 8 hours
  
  // Email OTP - ENABLED
  emailOTPEnabled: true,
};

// ============================================
// IN-MEMORY RATE LIMITING STORE
// ============================================
interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  blocked: boolean;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now - entry.firstAttempt > SECURITY_CONFIG.rateLimitWindowMs * 2) {
      rateLimitStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// ============================================
// AUDIT LOGGING
// ============================================
interface AuditLogEntry {
  timestamp: string;
  action: string;
  email?: string;
  ip: string;
  userAgent?: string;
  success: boolean;
  details?: string;
}

const auditLog: AuditLogEntry[] = [];
const MAX_AUDIT_LOG_SIZE = 10000;

function logAuditEvent(entry: Omit<AuditLogEntry, "timestamp">) {
  const logEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };
  
  auditLog.push(logEntry);
  
  if (auditLog.length > MAX_AUDIT_LOG_SIZE) {
    auditLog.shift();
  }
  
  console.log(`[AUDIT] ${logEntry.timestamp} | ${logEntry.action} | ${logEntry.email || 'N/A'} | ${logEntry.ip} | ${logEntry.success ? 'SUCCESS' : 'FAILED'} | ${logEntry.details || ''}`);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number; message?: string; remainingAttempts?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  
  if (!entry) {
    rateLimitStore.set(ip, {
      attempts: 1,
      firstAttempt: now,
      blocked: false,
    });
    return { allowed: true, remainingAttempts: SECURITY_CONFIG.maxLoginAttemptsPerIP - 1 };
  }
  
  if (entry.blocked && entry.blockedUntil) {
    if (now < entry.blockedUntil) {
      const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
      return {
        allowed: false,
        retryAfter,
        message: `Too many attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
        remainingAttempts: 0,
      };
    } else {
      rateLimitStore.set(ip, {
        attempts: 1,
        firstAttempt: now,
        blocked: false,
      });
      return { allowed: true, remainingAttempts: SECURITY_CONFIG.maxLoginAttemptsPerIP - 1 };
    }
  }
  
  if (now - entry.firstAttempt > SECURITY_CONFIG.rateLimitWindowMs) {
    rateLimitStore.set(ip, {
      attempts: 1,
      firstAttempt: now,
      blocked: false,
    });
    return { allowed: true, remainingAttempts: SECURITY_CONFIG.maxLoginAttemptsPerIP - 1 };
  }
  
  entry.attempts++;
  const remaining = SECURITY_CONFIG.maxLoginAttemptsPerIP - entry.attempts;
  
  if (entry.attempts > SECURITY_CONFIG.maxLoginAttemptsPerIP) {
    entry.blocked = true;
    entry.blockedUntil = now + SECURITY_CONFIG.rateLimitWindowMs;
    const retryAfter = Math.ceil(SECURITY_CONFIG.rateLimitWindowMs / 1000);
    return {
      allowed: false,
      retryAfter,
      message: `Too many attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
      remainingAttempts: 0,
    };
  }
  
  return { allowed: true, remainingAttempts: Math.max(0, remaining) };
}

function resetRateLimit(ip: string): void {
  rateLimitStore.delete(ip);
}

// ============================================
// DATABASE USER LOOKUP
// ============================================

interface AdminUserRecord {
  id: number;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
  isActive: boolean;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
}

/**
 * Look up an admin user by email in the admin_users database table.
 * Returns null if user not found or database unavailable.
 */
async function findAdminUserByEmail(email: string): Promise<AdminUserRecord | null> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Auth] Database not available for admin user lookup");
      return null;
    }
    
    const results = await db
      .select({
        id: adminUsers.id,
        email: adminUsers.email,
        name: adminUsers.name,
        passwordHash: adminUsers.passwordHash,
        role: adminUsers.role,
        isActive: adminUsers.isActive,
        failedLoginAttempts: adminUsers.failedLoginAttempts,
        lockedUntil: adminUsers.lockedUntil,
      })
      .from(adminUsers)
      .where(eq(adminUsers.email, email.toLowerCase()))
      .limit(1);
    
    if (results.length === 0) return null;
    return results[0] as AdminUserRecord;
  } catch (error) {
    console.error("[Auth] Error looking up admin user:", error);
    return null;
  }
}

/**
 * Update failed login attempts for a user
 */
async function updateFailedAttempts(userId: number, attempts: number, lockUntil?: Date): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    
    const updateData: any = { failedLoginAttempts: attempts };
    if (lockUntil) {
      updateData.lockedUntil = lockUntil;
    }
    
    await db.update(adminUsers).set(updateData).where(eq(adminUsers.id, userId));
  } catch (error) {
    console.error("[Auth] Error updating failed attempts:", error);
  }
}

/**
 * Record successful login for a user
 */
async function recordSuccessfulLogin(userId: number): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    
    await db.update(adminUsers).set({
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLogin: new Date(),
    }).where(eq(adminUsers.id, userId));
  } catch (error) {
    console.error("[Auth] Error recording successful login:", error);
  }
}

// ============================================
// OTP SESSION STORE (maps sessionId -> user info for Step 2)
// ============================================
interface OTPSessionData {
  userId: number;
  email: string;
  name: string;
  role: string;
  createdAt: number;
}

const otpSessionStore = new Map<string, OTPSessionData>();

// Clean up old OTP sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of otpSessionStore.entries()) {
    // Remove sessions older than 15 minutes
    if (now - entry.createdAt > 15 * 60 * 1000) {
      otpSessionStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// ============================================
// SESSION TOKEN
// ============================================
const SESSION_DURATION_MS = SECURITY_CONFIG.sessionDurationMs;

const getSessionSecret = () => {
  const secret = ENV.cookieSecret || process.env.COOKIE_SECRET || crypto.randomBytes(32).toString("hex");
  return new TextEncoder().encode(secret);
};

const parseCookies = (req: Request): Record<string, string> => {
  const cookieHeader = req.headers.cookie || "";
  const cookies: Record<string, string> = {};
  cookieHeader.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    if (name && rest.length > 0) {
      cookies[name] = rest.join("=");
    }
  });
  return cookies;
};

/**
 * Create a session token for an admin user.
 * The openId encodes the admin user's database ID (e.g., "admin_5").
 * The JWT also carries the user's name and role for quick access.
 */
const createAdminSessionToken = async (
  adminUserId: number,
  name: string,
  role: string,
  email: string
): Promise<string> => {
  const secretKey = getSessionSecret();
  const expirationSeconds = Math.floor((Date.now() + SESSION_DURATION_MS) / 1000);
  
  return new SignJWT({
    openId: `admin_${adminUserId}`,
    appId: ENV.appId || "3bsolution",
    name: name,
    role: role,
    email: email,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);
};

// ============================================
// BOOTSTRAP: Ensure required admin users exist
// ============================================
async function bootstrapAdminUsers(): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Auth Bootstrap] Database not available, skipping bootstrap");
      return;
    }

    // Define the required team members
    const requiredUsers = [
      {
        email: "mariobockph@3bsolution.de",
        name: "Mario Bock",
        password: "3BSolution2025!",
        role: "admin" as const,
      },
      {
        email: "bibianbockph@3bsolution.de",
        name: "Bibian Pacayra Bock",
        password: "Start@2026!",
        role: "director" as const,
      },
      {
        email: "georgblascheck@3bsolution.de",
        name: "Georg Blascheck",
        password: "Georg@0123!",
        role: "director" as const,
      },
      {
        email: "engelapacayraph@3bsolution.de",
        name: "Engela Pacayra Espares",
        password: "Start@2026!",
        role: "director" as const,
      },
    ];

    // Check each required user and create if missing
    let created = 0;
    for (const user of requiredUsers) {
      try {
        const existing = await db
          .select({ id: adminUsers.id })
          .from(adminUsers)
          .where(eq(adminUsers.email, user.email))
          .limit(1);
        
        if (existing.length > 0) {
          console.log(`[Auth Bootstrap] User ${user.email} already exists (id: ${existing[0].id}), skipping`);
          continue;
        }

        // User doesn't exist - create them
        const passwordHash = await hashPassword(user.password);
        await db.insert(adminUsers).values({
          email: user.email,
          name: user.name,
          passwordHash,
          role: user.role,
          isActive: true,
          mustChangePassword: true,
        });
        console.log(`[Auth Bootstrap] Created user: ${user.name} (${user.email}) as ${user.role}`);
        created++;
      } catch (insertErr) {
        console.warn(`[Auth Bootstrap] Could not create ${user.email}:`, insertErr);
      }
    }

    if (created > 0) {
      console.log(`[Auth Bootstrap] Created ${created} new admin user(s)`);
      console.log("[Auth Bootstrap] IMPORTANT: All new users should change their passwords after first login.");
    } else {
      console.log("[Auth Bootstrap] All required users already exist, no changes needed");
    }
  } catch (error) {
    console.error("[Auth Bootstrap] Failed to bootstrap admin users:", error);
  }
}

// ============================================
// REGISTER OAUTH ROUTES
// ============================================
export const registerOAuthRoutes = (app: Express) => {
  console.log("[Auth] Registering OAuth routes with Database Auth + Email OTP...");
  
  // Bootstrap admin users on startup (only seeds if table is empty)
  bootstrapAdminUsers().catch(err => {
    console.error("[Auth] Bootstrap error:", err);
  });
  console.log(`[Auth] Email OTP: ${SECURITY_CONFIG.emailOTPEnabled ? 'ENABLED' : 'DISABLED'}`);
  console.log("[Auth] Authentication source: PostgreSQL admin_users table");

  // ============================================
  // STEP 1: LOGIN - Verify password from DB and send OTP
  // ============================================
  app.post("/api/oauth/login", async (req: Request, res: Response) => {
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'];
    
    console.log("[Auth] Login attempt (Step 1) from IP:", clientIP);
    
    try {
      const { email, password } = req.body;

      // Check rate limit
      const rateCheck = checkRateLimit(clientIP);
      if (!rateCheck.allowed) {
        logAuditEvent({
          action: "LOGIN_RATE_LIMITED",
          email,
          ip: clientIP,
          userAgent,
          success: false,
          details: rateCheck.message,
        });
        return res.status(429).json({
          error: rateCheck.message,
          retryAfter: rateCheck.retryAfter,
        });
      }

      if (!email || !password) {
        logAuditEvent({
          action: "LOGIN_FAILED",
          email: email || "not provided",
          ip: clientIP,
          userAgent,
          success: false,
          details: "Missing email or password",
        });
        return res.status(400).json({ 
          error: "Email and password are required",
          remainingAttempts: rateCheck.remainingAttempts,
        });
      }

      const emailLower = email.toLowerCase().trim();

      // ---- LOOK UP USER IN DATABASE ----
      const adminUser = await findAdminUserByEmail(emailLower);
      
      if (!adminUser) {
        logAuditEvent({
          action: "LOGIN_FAILED",
          email: emailLower,
          ip: clientIP,
          userAgent,
          success: false,
          details: "Email not found in admin_users table",
        });
        return res.status(401).json({ 
          error: "Invalid email or password",
          remainingAttempts: rateCheck.remainingAttempts,
        });
      }

      // Check if account is active
      if (!adminUser.isActive) {
        logAuditEvent({
          action: "LOGIN_FAILED",
          email: emailLower,
          ip: clientIP,
          userAgent,
          success: false,
          details: "Account is deactivated",
        });
        return res.status(401).json({ 
          error: "Your account has been deactivated. Contact your administrator.",
          remainingAttempts: rateCheck.remainingAttempts,
        });
      }

      // Check if account is locked
      if (adminUser.lockedUntil && new Date(adminUser.lockedUntil) > new Date()) {
        const lockMinutes = Math.ceil((new Date(adminUser.lockedUntil).getTime() - Date.now()) / 60000);
        logAuditEvent({
          action: "LOGIN_FAILED",
          email: emailLower,
          ip: clientIP,
          userAgent,
          success: false,
          details: `Account locked for ${lockMinutes} more minutes`,
        });
        return res.status(401).json({ 
          error: `Account is temporarily locked. Try again in ${lockMinutes} minutes.`,
          remainingAttempts: 0,
        });
      }

      // ---- VERIFY PASSWORD AGAINST DATABASE HASH ----
      const passwordValid = await verifyPassword(password, adminUser.passwordHash);
      
      if (!passwordValid) {
        // Increment failed attempts
        const newAttempts = adminUser.failedLoginAttempts + 1;
        let lockUntil: Date | undefined;
        
        // Lock account after 5 failed attempts for 15 minutes
        if (newAttempts >= 5) {
          lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        }
        
        await updateFailedAttempts(adminUser.id, newAttempts, lockUntil);
        
        logAuditEvent({
          action: "LOGIN_FAILED",
          email: emailLower,
          ip: clientIP,
          userAgent,
          success: false,
          details: `Invalid password. Attempt ${newAttempts}/5.`,
        });
        
        return res.status(401).json({ 
          error: "Invalid email or password",
          remainingAttempts: rateCheck.remainingAttempts,
        });
      }

      // ---- PASSWORD VERIFIED ----
      console.log(`[Auth] Password verified for ${adminUser.name} (${adminUser.role}), sending OTP...`);
      
      // If Email OTP is enabled, send code
      if (SECURITY_CONFIG.emailOTPEnabled) {
        const otpResult = await sendOTP(adminUser.email);
        
        if (!otpResult.success) {
          logAuditEvent({
            action: "OTP_SEND_FAILED",
            email: adminUser.email,
            ip: clientIP,
            userAgent,
            success: false,
            details: otpResult.error,
          });
          return res.status(500).json({ 
            error: "Failed to send verification code. Please try again.",
            details: otpResult.error,
          });
        }
        
        // Store user info for OTP verification step
        if (otpResult.sessionId) {
          otpSessionStore.set(otpResult.sessionId, {
            userId: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            role: adminUser.role,
            createdAt: Date.now(),
          });
        }
        
        logAuditEvent({
          action: "OTP_SENT",
          email: adminUser.email,
          ip: clientIP,
          userAgent,
          success: true,
          details: `Verification code sent to ${adminUser.email}`,
        });
        
        return res.json({
          success: true,
          requiresOTP: true,
          sessionId: otpResult.sessionId,
          message: "Verification code sent to your email. Please check your inbox.",
        });
      }
      
      // If OTP disabled, log in directly
      resetRateLimit(clientIP);
      await recordSuccessfulLogin(adminUser.id);
      
      const token = await createAdminSessionToken(
        adminUser.id,
        adminUser.name,
        adminUser.role,
        adminUser.email
      );

      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_DURATION_MS,
        path: "/",
      });

      logAuditEvent({
        action: "LOGIN_SUCCESS",
        email: adminUser.email,
        ip: clientIP,
        userAgent,
        success: true,
        details: "Direct login (OTP disabled)",
      });

      return res.json({
        success: true,
        requiresOTP: false,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
        },
      });
    } catch (error) {
      console.error("[Auth] Login error:", error);
      logAuditEvent({
        action: "LOGIN_ERROR",
        ip: clientIP,
        userAgent,
        success: false,
        details: `Server error: ${error instanceof Error ? error.message : 'Unknown'}`,
      });
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ============================================
  // STEP 2: VERIFY OTP - Complete login
  // ============================================
  app.post("/api/oauth/verify-otp", async (req: Request, res: Response) => {
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'];
    
    console.log("[Auth] OTP verification (Step 2) from IP:", clientIP);
    
    try {
      const { sessionId, code } = req.body;

      if (!sessionId || !code) {
        return res.status(400).json({ error: "Session ID and verification code are required" });
      }

      // Get the email associated with this OTP session
      const email = getOTPEmail(sessionId);
      if (!email) {
        logAuditEvent({
          action: "OTP_VERIFY_FAILED",
          ip: clientIP,
          userAgent,
          success: false,
          details: "Invalid or expired session",
        });
        return res.status(400).json({ error: "Verification session expired. Please log in again." });
      }

      // Verify the OTP code
      const verifyResult = verifyOTP(sessionId, code);
      
      if (!verifyResult.valid) {
        logAuditEvent({
          action: "OTP_VERIFY_FAILED",
          email,
          ip: clientIP,
          userAgent,
          success: false,
          details: verifyResult.error,
        });
        return res.status(400).json({ 
          error: verifyResult.error,
          remainingAttempts: verifyResult.remainingAttempts,
        });
      }

      // OTP verified successfully - retrieve user info from our session store
      const sessionData = otpSessionStore.get(sessionId);
      
      // If session data exists, use it; otherwise look up user again from DB
      let userId: number;
      let userName: string;
      let userRole: string;
      let userEmail: string;
      
      if (sessionData) {
        userId = sessionData.userId;
        userName = sessionData.name;
        userRole = sessionData.role;
        userEmail = sessionData.email;
        otpSessionStore.delete(sessionId);
      } else {
        // Fallback: look up user by email from DB
        const adminUser = await findAdminUserByEmail(email);
        if (!adminUser) {
          return res.status(401).json({ error: "User account not found. Please contact your administrator." });
        }
        userId = adminUser.id;
        userName = adminUser.name;
        userRole = adminUser.role;
        userEmail = adminUser.email;
      }
      
      // Create session
      resetRateLimit(clientIP);
      await recordSuccessfulLogin(userId);
      
      const token = await createAdminSessionToken(userId, userName, userRole, userEmail);

      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_DURATION_MS,
        path: "/",
      });

      logAuditEvent({
        action: "LOGIN_SUCCESS",
        email: userEmail,
        ip: clientIP,
        userAgent,
        success: true,
        details: `Login completed with Email OTP verification (role: ${userRole})`,
      });

      return res.json({
        success: true,
        user: {
          id: userId,
          email: userEmail,
          name: userName,
          role: userRole,
        },
      });
    } catch (error) {
      console.error("[Auth] OTP verification error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ============================================
  // RESEND OTP
  // ============================================
  app.post("/api/oauth/resend-otp", async (req: Request, res: Response) => {
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'];
    
    try {
      const { email } = req.body;

      // Check rate limit
      const rateCheck = checkRateLimit(clientIP);
      if (!rateCheck.allowed) {
        return res.status(429).json({
          error: rateCheck.message,
          retryAfter: rateCheck.retryAfter,
        });
      }

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Check if email exists in admin_users database
      const emailLower = email.toLowerCase().trim();
      const adminUser = await findAdminUserByEmail(emailLower);
      
      if (!adminUser || !adminUser.isActive) {
        return res.status(401).json({ error: "Email not authorized" });
      }

      // Send new OTP
      const otpResult = await sendOTP(adminUser.email);
      
      if (!otpResult.success) {
        return res.status(500).json({ 
          error: "Failed to send verification code",
          details: otpResult.error,
        });
      }

      // Store user info for the new OTP session
      if (otpResult.sessionId) {
        otpSessionStore.set(otpResult.sessionId, {
          userId: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          createdAt: Date.now(),
        });
      }

      logAuditEvent({
        action: "OTP_RESENT",
        email: adminUser.email,
        ip: clientIP,
        userAgent,
        success: true,
      });

      return res.json({
        success: true,
        sessionId: otpResult.sessionId,
        message: "New verification code sent to your email.",
      });
    } catch (error) {
      console.error("[Auth] Resend OTP error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ============================================
  // LOGOUT
  // ============================================
  app.post("/api/oauth/logout", (req: Request, res: Response) => {
    const clientIP = getClientIP(req);
    
    logAuditEvent({
      action: "LOGOUT",
      ip: clientIP,
      userAgent: req.headers['user-agent'],
      success: true,
    });
    
    res.clearCookie(COOKIE_NAME, { path: "/" });
    return res.json({ success: true });
  });

  // ============================================
  // GET CURRENT USER
  // ============================================
  app.get("/api/oauth/me", async (req: Request, res: Response) => {
    try {
      const cookies = parseCookies(req);
      const token = cookies[COOKIE_NAME];

      if (!token) {
        return res.json({ user: null });
      }

      const secretKey = getSessionSecret();
      const { payload } = await jwtVerify(token, secretKey);
      
      if (!payload || !payload.openId) {
        return res.json({ user: null });
      }

      const openId = payload.openId as string;
      
      // Admin users have openId like "admin_5"
      if (openId.startsWith("admin_")) {
        const adminId = parseInt(openId.replace("admin_", ""), 10);
        
        // Look up current user info from database for freshness
        try {
          const db = await getDb();
          if (db) {
            const results = await db
              .select({
                id: adminUsers.id,
                email: adminUsers.email,
                name: adminUsers.name,
                role: adminUsers.role,
                isActive: adminUsers.isActive,
              })
              .from(adminUsers)
              .where(eq(adminUsers.id, adminId))
              .limit(1);
            
            if (results.length > 0 && results[0].isActive) {
              return res.json({
                user: {
                  id: results[0].id,
                  email: results[0].email,
                  name: results[0].name,
                  role: results[0].role,
                },
              });
            }
          }
        } catch (dbError) {
          console.warn("[Auth] DB lookup failed for /me, using JWT data:", dbError);
        }
        
        // Fallback to JWT payload data if DB lookup fails
        return res.json({
          user: {
            id: adminId,
            email: payload.email || "unknown",
            name: payload.name || "Admin User",
            role: payload.role || "admin",
          },
        });
      }

      // Visitor users have openId like "visitor_12"
      if (openId.startsWith("visitor_")) {
        const visitorId = parseInt(openId.replace("visitor_", ""), 10);
        
        try {
          const db = await getDb();
          if (db && !isNaN(visitorId)) {
            const results = await db
              .select({
                id: visitors.id,
                email: visitors.email,
                name: visitors.name,
                status: visitors.status,
              })
              .from(visitors)
              .where(eq(visitors.id, visitorId))
              .limit(1);
            
            if (results.length > 0 && results[0].status === "active") {
              return res.json({
                user: {
                  id: results[0].id,
                  email: results[0].email,
                  name: results[0].name || results[0].email,
                  role: "visitor",
                  isVisitor: true,
                },
              });
            }
          }
        } catch (dbError) {
          console.warn("[Auth] DB lookup failed for visitor /me:", dbError);
        }
        
        // Fallback to JWT payload data
        return res.json({
          user: {
            id: visitorId,
            email: payload.email || "unknown",
            name: payload.name || "Visitor",
            role: "visitor",
            isVisitor: true,
          },
        });
      }

      return res.json({ user: null });
    } catch (error) {
      return res.json({ user: null });
    }
  });

  // ============================================
  // AUDIT LOG (admin only)
  // ============================================
  app.get("/api/oauth/audit-log", async (req: Request, res: Response) => {
    try {
      const cookies = parseCookies(req);
      const token = cookies[COOKIE_NAME];

      if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const secretKey = getSessionSecret();
      const { payload } = await jwtVerify(token, secretKey);
      
      if (!payload || !payload.openId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const openId = payload.openId as string;
      if (!openId.startsWith("admin_")) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Only admin role can view audit logs
      const role = payload.role as string;
      if (role !== "admin") {
        return res.status(403).json({ error: "Forbidden - Admin role required" });
      }

      const recentLogs = auditLog.slice(-100).reverse();
      return res.json({ logs: recentLogs });
    } catch (error) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  });

  // ============================================
  // SECURITY STATUS (admin only)
  // ============================================
  app.get("/api/oauth/security-status", async (req: Request, res: Response) => {
    try {
      const cookies = parseCookies(req);
      const token = cookies[COOKIE_NAME];

      if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const secretKey = getSessionSecret();
      const { payload } = await jwtVerify(token, secretKey);
      
      if (!payload || !payload.openId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const openId = payload.openId as string;
      if (!openId.startsWith("admin_")) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const otpConfig = getOTPConfig();

      return res.json({
        rateLimiting: {
          enabled: true,
          maxAttempts: SECURITY_CONFIG.maxLoginAttemptsPerIP,
          windowMinutes: SECURITY_CONFIG.rateLimitWindowMs / 60000,
        },
        emailOTP: {
          enabled: SECURITY_CONFIG.emailOTPEnabled,
          ...otpConfig,
        },
        authSource: "PostgreSQL admin_users table",
        auditLog: {
          totalEntries: auditLog.length,
          recentFailedLogins: auditLog
            .filter(e => e.action.includes("FAILED") && Date.now() - new Date(e.timestamp).getTime() < 3600000)
            .length,
        },
      });
    } catch (error) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  });

  // ============================================
  // TEST EMAIL CONFIG (admin only)
  // ============================================
  app.get("/api/oauth/test-email", async (req: Request, res: Response) => {
    try {
      const cookies = parseCookies(req);
      const token = cookies[COOKIE_NAME];

      if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const secretKey = getSessionSecret();
      const { payload } = await jwtVerify(token, secretKey);
      
      if (!payload || !payload.openId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const openId = payload.openId as string;
      if (!openId.startsWith("admin_")) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const result = await testEmailConfiguration();
      return res.json(result);
    } catch (error) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  });

  // ============================================
  // VISITOR AUTH ROUTES (Passwordless Email OTP)
  // ============================================

  // Visitor cookie name (separate from admin)
  const VISITOR_COOKIE_NAME = "visitor_session_id";
  const VISITOR_SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

  /**
   * Create a session token for a visitor user.
   * The openId encodes the visitor's database ID (e.g., "visitor_12").
   */
  const createVisitorSessionToken = async (
    visitorId: number,
    name: string,
    email: string
  ): Promise<string> => {
    const secretKey = getSessionSecret();
    const expirationSeconds = Math.floor((Date.now() + VISITOR_SESSION_DURATION_MS) / 1000);
    
    return new SignJWT({
      openId: `visitor_${visitorId}`,
      appId: ENV.appId || "3bsolution",
      name: name,
      role: "visitor",
      email: email,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  };

  // STEP 1: Request visitor login - send OTP to email
  app.post("/api/visitor/request-login", async (req: Request, res: Response) => {
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'];
    
    try {
      const { email, name, gdprConsent } = req.body;

      // Check rate limit (shared with admin)
      const rateCheck = checkRateLimit(clientIP);
      if (!rateCheck.allowed) {
        return res.status(429).json({
          error: rateCheck.message,
          retryAfter: rateCheck.retryAfter,
        });
      }

      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Valid email address is required" });
      }

      const emailLower = email.toLowerCase().trim();
      const trimmedName = name?.trim() || null;

      // GDPR consent is required for new visitors
      // We'll check if they're already registered
      const db = await getDb();
      let existingVisitor = null;
      
      if (db) {
        const results = await db
          .select()
          .from(visitors)
          .where(eq(visitors.email, emailLower))
          .limit(1);
        existingVisitor = results[0] || null;
      }

      // If new visitor, require GDPR consent
      if (!existingVisitor && !gdprConsent) {
        return res.status(400).json({ 
          error: "GDPR consent is required to create an account",
          requiresConsent: true,
        });
      }

      // Send OTP via info@3bsolution.de
      const otpResult = await sendVisitorOTP(emailLower, trimmedName || existingVisitor?.name || undefined);
      
      if (!otpResult.success) {
        console.error("[Visitor Auth] Failed to send OTP:", otpResult.error);
        return res.status(500).json({ 
          error: "Failed to send verification code. Please try again.",
          details: otpResult.error,
        });
      }

      logAuditEvent({
        action: "VISITOR_OTP_SENT",
        email: emailLower,
        ip: clientIP,
        userAgent,
        success: true,
        details: existingVisitor ? "Returning visitor" : "New visitor registration",
      });

      return res.json({
        success: true,
        sessionId: otpResult.sessionId,
        isNewVisitor: !existingVisitor,
        message: "Verification code sent to your email.",
      });
    } catch (error) {
      console.error("[Visitor Auth] Request login error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // STEP 2: Verify visitor OTP and create session
  app.post("/api/visitor/verify-otp", async (req: Request, res: Response) => {
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'];
    
    try {
      const { sessionId, code, name, gdprConsent } = req.body;

      if (!sessionId || !code) {
        return res.status(400).json({ error: "Session ID and verification code are required" });
      }

      // Verify OTP
      const otpResult = verifyVisitorOTP(sessionId, code);
      
      if (!otpResult.valid) {
        logAuditEvent({
          action: "VISITOR_OTP_FAILED",
          ip: clientIP,
          userAgent,
          success: false,
          details: otpResult.error,
        });
        return res.status(401).json({ 
          error: otpResult.error,
          remainingAttempts: otpResult.remainingAttempts,
        });
      }

      const verifiedEmail = otpResult.email!;
      const visitorName = name?.trim() || otpResult.name || null;

      // Find or create visitor in database
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: "Database unavailable" });
      }

      let visitor = null;
      const existingResults = await db
        .select()
        .from(visitors)
        .where(eq(visitors.email, verifiedEmail))
        .limit(1);
      
      if (existingResults.length > 0) {
        visitor = existingResults[0];
        
        // Update last login and name if provided
        const updateData: any = { lastLogin: new Date(), status: "active" as const };
        if (visitorName && !visitor.name) {
          updateData.name = visitorName;
        }
        await db.update(visitors).set(updateData).where(eq(visitors.id, visitor.id));
        
        // Refresh visitor data
        const refreshed = await db.select().from(visitors).where(eq(visitors.id, visitor.id)).limit(1);
        visitor = refreshed[0] || visitor;
      } else {
        // Create new visitor
        const gdprConsentData = gdprConsent ? {
          version: "1.0",
          timestamp: new Date().toISOString(),
          ipAddress: clientIP,
        } : null;

        const insertResult = await db.insert(visitors).values({
          email: verifiedEmail,
          name: visitorName,
          status: "active",
          lastLogin: new Date(),
          gdprConsent: gdprConsentData,
        });
        
        const newId = insertResult[0].insertId;
        const newResults = await db.select().from(visitors).where(eq(visitors.id, newId)).limit(1);
        visitor = newResults[0];
      }

      if (!visitor) {
        return res.status(500).json({ error: "Failed to create visitor account" });
      }

      // Also ensure visitor exists in the main users table for wishlist/saved search compatibility
      const visitorOpenId = `visitor_${visitor.id}`;
      try {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.openId, visitorOpenId))
          .limit(1);
        
        if (existingUser.length === 0) {
          await db.insert(users).values({
            openId: visitorOpenId,
            name: visitor.name || visitor.email,
            email: visitor.email,
            loginMethod: "email_otp",
            role: "user",
            lastSignedIn: new Date(),
          });
          console.log(`[Visitor Auth] Created users table entry for visitor ${visitorOpenId}`);
        } else {
          await db.update(users)
            .set({ lastSignedIn: new Date(), name: visitor.name || visitor.email })
            .where(eq(users.openId, visitorOpenId));
        }
      } catch (userSyncError) {
        console.warn("[Visitor Auth] Failed to sync visitor to users table:", userSyncError);
        // Non-fatal - visitor can still use the system
      }

      // Create session token
      resetRateLimit(clientIP);
      const token = await createVisitorSessionToken(
        visitor.id,
        visitor.name || visitor.email,
        visitor.email
      );

      // Set both visitor cookie and main session cookie for compatibility
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
      };

      res.cookie(VISITOR_COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: VISITOR_SESSION_DURATION_MS,
      });

      // Also set the main session cookie so tRPC context picks up the visitor
      res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: VISITOR_SESSION_DURATION_MS,
      });

      logAuditEvent({
        action: "VISITOR_LOGIN_SUCCESS",
        email: verifiedEmail,
        ip: clientIP,
        userAgent,
        success: true,
        details: `Visitor ${visitor.id} logged in successfully`,
      });

      return res.json({
        success: true,
        visitor: {
          id: visitor.id,
          email: visitor.email,
          name: visitor.name,
          status: visitor.status,
        },
      });
    } catch (error) {
      console.error("[Visitor Auth] Verify OTP error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Resend visitor OTP
  app.post("/api/visitor/resend-otp", async (req: Request, res: Response) => {
    const clientIP = getClientIP(req);
    
    try {
      const { email } = req.body;

      const rateCheck = checkRateLimit(clientIP);
      if (!rateCheck.allowed) {
        return res.status(429).json({
          error: rateCheck.message,
          retryAfter: rateCheck.retryAfter,
        });
      }

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const emailLower = email.toLowerCase().trim();
      const otpResult = await sendVisitorOTP(emailLower);
      
      if (!otpResult.success) {
        return res.status(500).json({ 
          error: "Failed to send verification code",
          details: otpResult.error,
        });
      }

      return res.json({
        success: true,
        sessionId: otpResult.sessionId,
        message: "New verification code sent to your email.",
      });
    } catch (error) {
      console.error("[Visitor Auth] Resend OTP error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Visitor logout
  app.post("/api/visitor/logout", (req: Request, res: Response) => {
    const clientIP = getClientIP(req);
    
    logAuditEvent({
      action: "VISITOR_LOGOUT",
      ip: clientIP,
      userAgent: req.headers['user-agent'],
      success: true,
    });
    
    res.clearCookie(VISITOR_COOKIE_NAME, { path: "/" });
    res.clearCookie(COOKIE_NAME, { path: "/" });
    return res.json({ success: true });
  });

  // Get current visitor session
  app.get("/api/visitor/me", async (req: Request, res: Response) => {
    try {
      const cookies = parseCookies(req);
      // Check visitor cookie first, then main cookie
      const token = cookies[VISITOR_COOKIE_NAME] || cookies[COOKIE_NAME];

      if (!token) {
        return res.json({ visitor: null });
      }

      const secretKey = getSessionSecret();
      const { payload } = await jwtVerify(token, secretKey);
      
      if (!payload || !payload.openId) {
        return res.json({ visitor: null });
      }

      const openId = payload.openId as string;
      
      // Only return visitor data for visitor sessions
      if (!openId.startsWith("visitor_")) {
        return res.json({ visitor: null });
      }

      const visitorId = parseInt(openId.replace("visitor_", ""), 10);
      
      const db = await getDb();
      if (db && !isNaN(visitorId)) {
        const results = await db
          .select({
            id: visitors.id,
            email: visitors.email,
            name: visitors.name,
            status: visitors.status,
          })
          .from(visitors)
          .where(eq(visitors.id, visitorId))
          .limit(1);
        
        if (results.length > 0 && results[0].status === "active") {
          return res.json({
            visitor: results[0],
          });
        }
      }

      return res.json({ visitor: null });
    } catch (error) {
      return res.json({ visitor: null });
    }
  });

  // ============================================
  // VISITOR STATS (for admin dashboard)
  // ============================================
  app.get("/api/visitor/stats", async (req: Request, res: Response) => {
    try {
      // Verify admin session
      const cookies = parseCookies(req);
      const token = cookies[COOKIE_NAME];
      if (!token) return res.status(401).json({ error: "Unauthorized" });
      
      const secretKey = getSessionSecret();
      const { payload } = await jwtVerify(token, secretKey);
      if (!payload?.openId || !(payload.openId as string).startsWith("admin_")) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const db = await getDb();
      if (!db) return res.json({ totalVisitors: 0, activeVisitors: 0, recentRegistrations: [] });

      const [totalCount, activeCount, recentVisitors] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(visitors).then((r: any) => r[0]?.count || 0),
        db.select({ count: sql<number>`count(*)` }).from(visitors).where(eq(visitors.status, "active")).then((r: any) => r[0]?.count || 0),
        db.select({
          id: visitors.id,
          email: visitors.email,
          name: visitors.name,
          status: visitors.status,
          createdAt: visitors.createdAt,
          lastLogin: visitors.lastLogin,
        }).from(visitors).orderBy(sql`${visitors.createdAt} DESC`).limit(20),
      ]);

      return res.json({
        totalVisitors: totalCount,
        activeVisitors: activeCount,
        recentRegistrations: recentVisitors,
      });
    } catch (error) {
      console.error("[Visitor Stats] Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  console.log("[Auth] OAuth routes with Database Auth + Email OTP registered successfully");
  console.log("[Auth] Visitor auth routes registered (passwordless OTP via info@3bsolution.de)");
};

// Verify token helper (used by other modules)
export const verifyToken = async (token: string) => {
  try {
    const secretKey = getSessionSecret();
    const { payload } = await jwtVerify(token, secretKey);
    
    if (!payload || !payload.openId) {
      return null;
    }
    
    return {
      openId: payload.openId as string,
      appId: payload.appId as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
};

// Password hashing (used by adminUserRouters for creating/resetting users)
export const hashPassword = async (password: string): Promise<string> => {
  const salt = crypto.randomBytes(32).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    const [salt, key] = hash.split(":");
    if (!salt || !key) return false;
    
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
        if (err) reject(err);
        resolve(key === derivedKey.toString("hex"));
      });
    });
  } catch {
    return false;
  }
};
