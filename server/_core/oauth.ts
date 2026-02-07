import { Express, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { COOKIE_NAME as SHARED_COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ENV } from "./env";
import { sendOTP, verifyOTP, getOTPEmail, getOTPConfig, testEmailConfiguration } from "./email-otp-service";

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
  
  // Allowed admin emails (only these can log in)
  allowedAdminEmails: (process.env.ADMIN_USERS || "admin@3bsolution.com").split(",").map(e => e.trim().toLowerCase()),
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

// Legacy admin credentials (still used for password step)
const LEGACY_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@3bsolution.com";
const LEGACY_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "3BSolution2025!";
const LEGACY_ADMIN_NAME = process.env.ADMIN_NAME || "Admin User";

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

const createSessionToken = async (openId: string, name: string): Promise<string> => {
  const secretKey = getSessionSecret();
  const expirationSeconds = Math.floor((Date.now() + SESSION_DURATION_MS) / 1000);
  
  return new SignJWT({
    openId: openId,
    appId: ENV.appId || "3bsolution",
    name: name,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);
};

// ============================================
// REGISTER OAUTH ROUTES
// ============================================
export const registerOAuthRoutes = (app: Express) => {
  console.log("[Auth] Registering OAuth routes with Email OTP...");
  console.log(`[Auth] Email OTP: ${SECURITY_CONFIG.emailOTPEnabled ? 'ENABLED' : 'DISABLED'}`);
  console.log(`[Auth] Allowed admins: ${SECURITY_CONFIG.allowedAdminEmails.join(', ')}`);

  // ============================================
  // STEP 1: LOGIN - Verify password and send OTP
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

      // Check if email is in allowed list
      const emailLower = email.toLowerCase();
      if (!SECURITY_CONFIG.allowedAdminEmails.includes(emailLower)) {
        logAuditEvent({
          action: "LOGIN_FAILED",
          email,
          ip: clientIP,
          userAgent,
          success: false,
          details: "Email not in allowed admin list",
        });
        return res.status(401).json({ 
          error: "Invalid email or password",
          remainingAttempts: rateCheck.remainingAttempts,
        });
      }

      // Verify password (legacy admin check)
      if (emailLower === LEGACY_ADMIN_EMAIL.toLowerCase() && password === LEGACY_ADMIN_PASSWORD) {
        console.log("[Auth] Password verified, sending OTP...");
        
        // If Email OTP is enabled, send code
        if (SECURITY_CONFIG.emailOTPEnabled) {
          const otpResult = await sendOTP(email);
          
          if (!otpResult.success) {
            logAuditEvent({
              action: "OTP_SEND_FAILED",
              email,
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
          
          logAuditEvent({
            action: "OTP_SENT",
            email,
            ip: clientIP,
            userAgent,
            success: true,
            details: "Verification code sent to email",
          });
          
          return res.json({
            success: true,
            requiresOTP: true,
            sessionId: otpResult.sessionId,
            message: "Verification code sent to your email. Please check your inbox.",
          });
        }
        
        // If OTP disabled, log in directly (not recommended)
        resetRateLimit(clientIP);
        const adminOpenId = "admin_0";
        const token = await createSessionToken(adminOpenId, LEGACY_ADMIN_NAME);

        res.cookie(COOKIE_NAME, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: SESSION_DURATION_MS,
          path: "/",
        } );

        logAuditEvent({
          action: "LOGIN_SUCCESS",
          email,
          ip: clientIP,
          userAgent,
          success: true,
          details: "Direct login (OTP disabled)",
        });

        return res.json({
          success: true,
          requiresOTP: false,
          user: {
            id: 0,
            email: LEGACY_ADMIN_EMAIL,
            name: LEGACY_ADMIN_NAME,
            role: "admin",
          },
        });
      }

      logAuditEvent({
        action: "LOGIN_FAILED",
        email,
        ip: clientIP,
        userAgent,
        success: false,
        details: `Invalid credentials. ${rateCheck.remainingAttempts} attempts remaining.`,
      });
      
      return res.status(401).json({ 
        error: "Invalid email or password",
        remainingAttempts: rateCheck.remainingAttempts,
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

      // OTP verified successfully - create session
      resetRateLimit(clientIP);
      
      const adminOpenId = "admin_0";
      const token = await createSessionToken(adminOpenId, LEGACY_ADMIN_NAME);

      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_DURATION_MS,
        path: "/",
      } );

      logAuditEvent({
        action: "LOGIN_SUCCESS",
        email,
        ip: clientIP,
        userAgent,
        success: true,
        details: "Login completed with Email OTP verification",
      });

      return res.json({
        success: true,
        user: {
          id: 0,
          email: LEGACY_ADMIN_EMAIL,
          name: LEGACY_ADMIN_NAME,
          role: "admin",
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

      // Check if email is allowed
      const emailLower = email.toLowerCase();
      if (!SECURITY_CONFIG.allowedAdminEmails.includes(emailLower)) {
        return res.status(401).json({ error: "Email not authorized" });
      }

      // Send new OTP
      const otpResult = await sendOTP(email);
      
      if (!otpResult.success) {
        return res.status(500).json({ 
          error: "Failed to send verification code",
          details: otpResult.error,
        });
      }

      logAuditEvent({
        action: "OTP_RESENT",
        email,
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

      if (payload.openId === "admin_0") {
        return res.json({
          user: {
            id: 0,
            email: LEGACY_ADMIN_EMAIL,
            name: payload.name || LEGACY_ADMIN_NAME,
            role: "admin",
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
      
      if (!payload || payload.openId !== "admin_0") {
        return res.status(403).json({ error: "Forbidden" });
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
      
      if (!payload || payload.openId !== "admin_0") {
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
        allowedAdmins: SECURITY_CONFIG.allowedAdminEmails,
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
      
      if (!payload || payload.openId !== "admin_0") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const result = await testEmailConfiguration();
      return res.json(result);
    } catch (error) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  });

  // Change password endpoint (disabled for legacy admin)
  app.post("/api/oauth/change-password", (req: Request, res: Response) => {
    return res.status(400).json({ error: "Password change not available for legacy admin" });
  });

  console.log("[Auth] OAuth routes with Email OTP registered successfully");
};

// Verify token helper
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

// Password hashing (kept for compatibility)
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
  const [salt, key] = hash.split(":");
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err);
      resolve(key === derivedKey.toString("hex"));
    });
  });
};
