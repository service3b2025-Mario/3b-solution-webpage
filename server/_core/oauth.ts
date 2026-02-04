import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { createHash, randomBytes } from "crypto";
import { SignJWT } from "jose";
import * as userMgmt from "../userManagement";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

// Simple password hashing function (legacy - kept for backward compatibility)
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// Legacy admin credentials - used as fallback if no users exist in database
const LEGACY_ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || "admin@3bsolution.com",
  passwordHash: process.env.ADMIN_PASSWORD_HASH || hashPassword("3BSolution2025!"),
  name: process.env.ADMIN_NAME || "Admin User",
};

// Get or create a secret for signing JWTs
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.COOKIE_SECRET || "3b-solution-admin-secret-key-2025";
  return new TextEncoder().encode(secret);
}

// Session duration: 8 hours for regular sessions
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

// Create a simple session token
async function createSimpleSessionToken(openId: string, name: string, role: string): Promise<string> {
  const secretKey = getJwtSecret();
  const expirationTime = Math.floor((Date.now() + SESSION_DURATION_MS) / 1000);
  
  return new SignJWT({
    openId,
    appId: "3b-solution-admin",
    name,
    role,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationTime)
    .sign(secretKey);
}

export function registerOAuthRoutes(app: Express) {
  // Email/Password Login endpoint - now uses multi-user system
  app.post("/api/oauth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      console.log("[Auth] Login attempt for:", email);

      if (!email || !password) {
        console.log("[Auth] Missing email or password");
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      // First, try the new multi-user authentication system
      const loginResult = await userMgmt.handleLogin(email, password, ipAddress, userAgent);
      
      if (loginResult.success && loginResult.user) {
        console.log("[Auth] Multi-user login successful for:", email);
        
        // Create JWT session token
        const sessionToken = await createSimpleSessionToken(
          loginResult.user.openId,
          loginResult.user.name || email,
          loginResult.user.role
        );

        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: SESSION_DURATION_MS });

        // Log the login action
        await userMgmt.logAuditAction({
          userId: loginResult.user.id,
          userEmail: email,
          action: 'login_success',
          details: { loginMethod: 'email' },
          ipAddress,
          userAgent,
        });

        console.log("[Auth] Login successful, sending response");
        res.json({ success: true, redirectUrl: "/admin" });
        return;
      }

      // If multi-user login failed, try legacy admin credentials as fallback
      // This ensures backward compatibility during migration
      const legacyPasswordHash = hashPassword(password);
      
      if (email === LEGACY_ADMIN_CREDENTIALS.email && 
          legacyPasswordHash === LEGACY_ADMIN_CREDENTIALS.passwordHash) {
        console.log("[Auth] Legacy admin login successful");
        
        // Generate a unique openId for legacy admin
        const adminOpenId = `admin_${hashPassword(email).substring(0, 16)}`;

        // Upsert the legacy admin user in database
        try {
          await db.upsertUser({
            openId: adminOpenId,
            name: LEGACY_ADMIN_CREDENTIALS.name,
            email: email,
            loginMethod: "email",
            lastSignedIn: new Date(),
            role: "Admin", // Use new role format
          });
        } catch (dbError) {
          console.error("[Auth] Database error (non-fatal):", dbError);
        }

        // Create session token
        const sessionToken = await createSimpleSessionToken(
          adminOpenId, 
          LEGACY_ADMIN_CREDENTIALS.name,
          "Admin"
        );

        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: SESSION_DURATION_MS });

        res.json({ success: true, redirectUrl: "/admin" });
        return;
      }

      // Both authentication methods failed
      console.log("[Auth] Invalid credentials for:", email);
      
      // Log failed attempt
      await userMgmt.logAuditAction({
        userEmail: email,
        action: 'login_failed',
        details: { reason: loginResult.error || 'Invalid credentials' },
        ipAddress,
        userAgent,
      });

      res.status(401).json({ error: loginResult.error || "Invalid email or password" });
    } catch (error) {
      console.error("[Auth] Login failed with error:", error);
      res.status(500).json({ error: "Login failed: " + (error instanceof Error ? error.message : "Unknown error") });
    }
  });

  // Logout endpoint
  app.post("/api/oauth/logout", async (req: Request, res: Response) => {
    try {
      const cookieOptions = getSessionCookieOptions(req);
      res.clearCookie(COOKIE_NAME, cookieOptions);
      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Logout failed", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  // OAuth callback (existing functionality - kept for compatibility)
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      // Import sdk dynamically to avoid initialization issues
      const { sdk } = await import("./sdk");
      
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
