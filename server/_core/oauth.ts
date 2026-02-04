import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { createHash } from "crypto";

// Extended role type for RBAC
type Role = 'admin' | 'director' | 'dataEditor' | 'propertySpecialist' | 'salesSpecialist';

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

// Simple password hashing function
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// User configuration interface
interface UserConfig {
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
}

// Parse users from environment variable
// Format: email1:password1:name1:role1,email2:password2:name2:role2
function parseUsersFromEnv(): UserConfig[] {
  const usersEnv = process.env.ADMIN_USERS;
  
  if (!usersEnv) {
    // Fallback to legacy single admin credentials
    return [{
      email: process.env.ADMIN_EMAIL || "admin@3bsolution.com",
      passwordHash: process.env.ADMIN_PASSWORD_HASH || hashPassword("3BSolution2025!"),
      name: process.env.ADMIN_NAME || "Admin User",
      role: 'admin' as Role,
    }];
  }
  
  const users: UserConfig[] = [];
  const userEntries = usersEnv.split(',');
  
  for (const entry of userEntries) {
    const parts = entry.trim().split(':');
    if (parts.length >= 4) {
      const [email, password, name, role] = parts;
      users.push({
        email: email.trim(),
        passwordHash: hashPassword(password.trim()),
        name: name.trim(),
        role: (role.trim() as Role) || 'admin',
      });
    }
  }
  
  // Always include the default admin if no users configured
  if (users.length === 0) {
    users.push({
      email: process.env.ADMIN_EMAIL || "admin@3bsolution.com",
      passwordHash: process.env.ADMIN_PASSWORD_HASH || hashPassword("3BSolution2025!"),
      name: process.env.ADMIN_NAME || "Admin User",
      role: 'admin' as Role,
    });
  }
  
  return users;
}

// Get all configured users
const CONFIGURED_USERS = parseUsersFromEnv();

// Session duration: 8 hours for better security
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

export function registerOAuthRoutes(app: Express) {
  // Email/Password Login endpoint
  app.post("/api/oauth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      // Check credentials against all configured users
      const passwordHash = hashPassword(password);
      const matchedUser = CONFIGURED_USERS.find(
        user => user.email.toLowerCase() === email.toLowerCase() && user.passwordHash === passwordHash
      );
      
      if (!matchedUser) {
        // Log failed attempt (for security monitoring)
        console.log(`[Auth] Failed login attempt for email: ${email}`);
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Generate a unique openId for this user
      const userOpenId = `user_${hashPassword(matchedUser.email).substring(0, 16)}`;

      // Upsert the user in the database
      await db.upsertUser({
        openId: userOpenId,
        name: matchedUser.name,
        email: matchedUser.email,
        loginMethod: "email",
        lastSignedIn: new Date(),
      });

      // Ensure the user has the correct role
      const user = await db.getUserByOpenId(userOpenId);
      const dbRole = matchedUser.role === 'admin' || matchedUser.role === 'director' ? 'admin' : 'user';
      if (user && user.role !== dbRole) {
        await db.updateUserRole(userOpenId, dbRole);
      }

      // Create session token with user role info
      const sessionToken = await sdk.createSessionToken(userOpenId, {
        name: matchedUser.name,
        expiresInMs: SESSION_DURATION_MS,
        // Store role in session metadata
        metadata: { role: matchedUser.role },
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: SESSION_DURATION_MS });

      // Log successful login
      console.log(`[Auth] Successful login for: ${matchedUser.email} (${matchedUser.role})`);

      res.json({ 
        success: true, 
        redirectUrl: "/admin",
        user: {
          name: matchedUser.name,
          email: matchedUser.email,
          role: matchedUser.role,
        }
      });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get current user info endpoint
  app.get("/api/oauth/me", async (req: Request, res: Response) => {
    try {
      // Get user from session
      const sessionCookie = req.cookies[COOKIE_NAME];
      if (!sessionCookie) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const sessionData = await sdk.verifySessionToken(sessionCookie);
      if (!sessionData || !sessionData.openId) {
        res.status(401).json({ error: "Invalid session" });
        return;
      }

      const user = await db.getUserByOpenId(sessionData.openId);
      if (!user) {
        res.status(401).json({ error: "User not found" });
        return;
      }

      // Find the user's role from config
      const configUser = CONFIGURED_USERS.find(
        u => u.email.toLowerCase() === user.email?.toLowerCase()
      );

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: configUser?.role || (user.role === 'admin' ? 'admin' : 'user'),
      });
    } catch (error) {
      console.error("[Auth] Get user info failed", error);
      res.status(500).json({ error: "Failed to get user info" });
    }
  });

  // Logout endpoint
  app.post("/api/oauth/logout", async (req: Request, res: Response) => {
    try {
      const cookieOptions = getSessionCookieOptions(req);
      res.clearCookie(COOKIE_NAME, cookieOptions);
      console.log("[Auth] User logged out");
      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Logout failed", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  // OAuth callback (existing functionality)
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
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
        expiresInMs: SESSION_DURATION_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: SESSION_DURATION_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
