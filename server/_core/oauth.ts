import { Express, Request, Response } from "express";
import crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { COOKIE_NAME as SHARED_COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ENV } from "./env";

// Re-export COOKIE_NAME for other files that import from oauth
export const COOKIE_NAME = SHARED_COOKIE_NAME;

// Password hashing using Node.js built-in crypto (no external dependencies)
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

// Legacy admin credentials (fallback)
const LEGACY_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@3bsolution.com";
const LEGACY_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "3BSolution2025!";
const LEGACY_ADMIN_NAME = process.env.ADMIN_NAME || "Admin User";

// Session duration
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

// Helper function to get session secret
const getSessionSecret = () => {
  const secret = ENV.cookieSecret || process.env.COOKIE_SECRET || crypto.randomBytes(32).toString("hex");
  return new TextEncoder().encode(secret);
};

// Helper function to parse cookies from request
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

// Create session token compatible with SDK
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

// Register OAuth routes on Express app
export const registerOAuthRoutes = (app: Express) => {
  console.log("[Auth] Registering OAuth routes...");

  // Login endpoint
  app.post("/api/oauth/login", async (req: Request, res: Response) => {
    console.log("[Auth] Login attempt received");
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        console.log("[Auth] Missing email or password");
        return res.status(400).json({ error: "Email and password are required" });
      }

      console.log("[Auth] Checking credentials for:", email);

      // Check legacy admin credentials
      if (email === LEGACY_ADMIN_EMAIL && password === LEGACY_ADMIN_PASSWORD) {
        console.log("[Auth] Legacy admin login successful");

        // Create openId for admin user (format: admin_0)
        const adminOpenId = "admin_0";
        
        // Create session token compatible with SDK
        const token = await createSessionToken(adminOpenId, LEGACY_ADMIN_NAME);

        res.cookie(COOKIE_NAME, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: SESSION_DURATION_MS,
          path: "/",
        } );

        return res.json({
          success: true,
          user: {
            id: 0,
            email: LEGACY_ADMIN_EMAIL,
            name: LEGACY_ADMIN_NAME,
            role: "admin",
            mustChangePassword: false,
          },
        });
      }

      console.log("[Auth] Invalid credentials");
      return res.status(401).json({ error: "Invalid email or password" });
    } catch (error) {
      console.error("[Auth] Login error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/oauth/logout", (req: Request, res: Response) => {
    console.log("[Auth] Logout request received");
    res.clearCookie(COOKIE_NAME, { path: "/" });
    return res.json({ success: true });
  });

  // Get current user endpoint
  app.get("/api/oauth/me", async (req: Request, res: Response) => {
    try {
      const cookies = parseCookies(req);
      const token = cookies[COOKIE_NAME];

      if (!token) {
        console.log("[Auth] No session cookie found");
        return res.json({ user: null });
      }

      // Verify token using jose (same as SDK)
      const secretKey = getSessionSecret();
      const { payload } = await jwtVerify(token, secretKey);
      
      if (!payload || !payload.openId) {
        return res.json({ user: null });
      }

      // Check if this is the legacy admin
      if (payload.openId === "admin_0") {
        return res.json({
          user: {
            id: 0,
            email: LEGACY_ADMIN_EMAIL,
            name: payload.name || LEGACY_ADMIN_NAME,
            role: "admin",
            mustChangePassword: false,
          },
        });
      }

      return res.json({ user: null });
    } catch (error) {
      console.error("[Auth] Get user error:", error);
      return res.json({ user: null });
    }
  });

  // Change password endpoint (disabled for legacy admin)
  app.post("/api/oauth/change-password", (req: Request, res: Response) => {
    return res.status(400).json({ error: "Password change not available for legacy admin" });
  });

  console.log("[Auth] OAuth routes registered successfully");
};

// Verify token helper for SDK compatibility
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
