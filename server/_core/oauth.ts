import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { createHash } from "crypto";


function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}


// Simple password hashing function
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}


// Admin credentials - these should be set via environment variables in production
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || "admin@3bsolution.com",
  // Default password is "3BSolution2025!" - CHANGE THIS IN PRODUCTION via ADMIN_PASSWORD_HASH env var
  passwordHash: process.env.ADMIN_PASSWORD_HASH || hashPassword("3BSolution2025!"),
  name: process.env.ADMIN_NAME || "Admin User",
};


export function registerOAuthRoutes(app: Express) {
  // Email/Password Login endpoint
  app.post("/api/oauth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;


      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }


      // Check credentials
      const passwordHash = hashPassword(password);
      
      if (email !== ADMIN_CREDENTIALS.email || passwordHash !== ADMIN_CREDENTIALS.passwordHash) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }


      // Generate a unique openId for this admin user
      const adminOpenId = `admin_${hashPassword(email).substring(0, 16)}`;


      // Upsert the admin user in the database
      await db.upsertUser({
        openId: adminOpenId,
        name: ADMIN_CREDENTIALS.name,
        email: email,
        loginMethod: "email",
        lastSignedIn: new Date(),
      });


      // Ensure the user has admin role
      const user = await db.getUserByOpenId(adminOpenId);
      if (user && user.role !== "admin") {
        // Update user role to admin
        await db.updateUserRole(adminOpenId, "admin");
      }


      // Create session token
      const sessionToken = await sdk.createSessionToken(adminOpenId, {
        name: ADMIN_CREDENTIALS.name,
        expiresInMs: ONE_YEAR_MS,
      });


      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });


      res.json({ success: true, redirectUrl: "/admin" });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
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
