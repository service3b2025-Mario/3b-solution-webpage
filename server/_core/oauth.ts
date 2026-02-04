import { Express, Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import cookieParser from "cookie-parser";

// Cookie name for session management
const COOKIE_NAME = "app_session_id";

// Legacy admin credentials (fallback)
const LEGACY_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@3bsolution.com";
const LEGACY_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "3BSolution2025!";
const LEGACY_ADMIN_NAME = process.env.ADMIN_NAME || "Admin User";

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");
const SESSION_DURATION = 8 * 60 * 60; // 8 hours in seconds

// Export COOKIE_NAME for use in other files
export { COOKIE_NAME };

// Register OAuth routes on Express app
export const registerOAuthRoutes = (app: Express) => {
  // Add cookie parser middleware
  app.use(cookieParser());

  // Login endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      console.log("[Auth] Login attempt for:", email);

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Check for legacy admin first (this always works without database)
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
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: SESSION_DURATION * 1000,
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

      // If not legacy admin, return error (database users disabled for now)
      console.log("[Auth] Login failed - invalid credentials");
      return res.status(401).json({ error: "Invalid email or password" });

    } catch (error) {
      console.error("[Auth] Login error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    try {
      res.clearCookie(COOKIE_NAME, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      } );
      return res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Logout error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get current user endpoint
  app.get("/api/auth/me", (req: Request, res: Response) => {
    try {
      const token = req.cookies[COOKIE_NAME];
      if (!token) {
        console.log("[Auth] Missing session cookie");
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
  app.post("/api/auth/change-password", (req: Request, res: Response) => {
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
