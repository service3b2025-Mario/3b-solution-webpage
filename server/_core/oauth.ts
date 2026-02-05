import { Express, Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Cookie name for session management
const COOKIE_NAME = "app_session_id";

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

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");
const SESSION_DURATION = 8 * 60 * 60; // 8 hours in seconds

// Export COOKIE_NAME for use in other files
export { COOKIE_NAME };

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

        const token = jwt.sign(
          {
            sub: "0",
            email: LEGACY_ADMIN_EMAIL,
            name: LEGACY_ADMIN_NAME,
            role: "admin",
            mustChangePassword: false,
          },
          JWT_SECRET,
          { expiresIn: SESSION_DURATION }
        );

        res.cookie(COOKIE_NAME, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: SESSION_DURATION * 1000,
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
  app.get("/api/oauth/me", (req: Request, res: Response) => {
    try {
      const cookies = parseCookies(req);
      const token = cookies[COOKIE_NAME];

      if (!token) {
        console.log("[Auth] No session cookie found");
        return res.json({ user: null });
      }

      const payload = jwt.verify(token, JWT_SECRET) as any;
      if (!payload || !payload.sub) {
        return res.json({ user: null });
      }

      return res.json({
        user: {
          id: parseInt(payload.sub),
          email: payload.email,
          name: payload.name,
          role: payload.role,
          mustChangePassword: payload.mustChangePassword,
        },
      });
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

// Verify token helper for SDK
export const verifyToken = async (token: string) => {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (!payload || !payload.sub) {
      return null;
    }
    return {
      id: parseInt(payload.sub),
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
      mustChangePassword: payload.mustChangePassword as boolean,
    };
  } catch {
    return null;
  }
};
