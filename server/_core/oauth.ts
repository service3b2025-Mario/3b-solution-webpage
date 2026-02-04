import { Express, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getDb } from "../db";
import { adminUsers } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { COOKIE_NAME } from "./cookies";

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

// Register OAuth routes on Express app
export const registerOAuthRoutes = (app: Express) => {
  // Login endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const db = await getDb();

      // Check for legacy admin first
      if (email === LEGACY_ADMIN_EMAIL && password === LEGACY_ADMIN_PASSWORD) {
        const token = sign(
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

      // Check database for user
      if (!db) {
        return res.status(500).json({ error: "Database not available" });
      }

      const [user] = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.email, email))
        .limit(1);

      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Check if account is locked
      if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
        return res.status(423).json({ error: "Account is locked. Please try again later." });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(403).json({ error: "Account is disabled" });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        // Increment failed login attempts
        const failedAttempts = (user.failedLoginAttempts || 0) + 1;
        const lockUntil = failedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

        await db
          .update(adminUsers)
          .set({
            failedLoginAttempts: failedAttempts,
            lockedUntil: lockUntil,
          })
          .where(eq(adminUsers.id, user.id));

        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Reset failed login attempts and update last login
      await db
        .update(adminUsers)
        .set({
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastLogin: new Date(),
        })
        .where(eq(adminUsers.id, user.id));

      // Generate JWT token
      const token = sign(
        {
          sub: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
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
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME, { path: "/" });
    return res.json({ success: true });
  });

  // Get current user endpoint
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const token = req.cookies[COOKIE_NAME];
      if (!token) {
        return res.json({ user: null });
      }

      const payload = verify(token, JWT_SECRET) as any;
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
      res.clearCookie(COOKIE_NAME, { path: "/" });
      return res.json({ user: null });
    }
  });

  // Change password endpoint
  app.post("/api/auth/change-password", async (req: Request, res: Response) => {
    try {
      const token = req.cookies[COOKIE_NAME];
      if (!token) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const payload = verify(token, JWT_SECRET) as any;
      if (!payload || !payload.sub) {
        return res.status(401).json({ error: "Invalid session" });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current and new password are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: "New password must be at least 8 characters" });
      }

      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: "Database not available" });
      }

      const userId = parseInt(payload.sub);

      // Handle legacy admin
      if (userId === 0) {
        if (currentPassword !== LEGACY_ADMIN_PASSWORD) {
          return res.status(401).json({ error: "Current password is incorrect" });
        }
        return res.status(400).json({ error: "Cannot change password for legacy admin" });
      }

      const [user] = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.id, userId))
        .limit(1);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      const newPasswordHash = await hashPassword(newPassword);

      await db
        .update(adminUsers)
        .set({
          passwordHash: newPasswordHash,
          mustChangePassword: false,
          updatedAt: new Date(),
        })
        .where(eq(adminUsers.id, userId));

      return res.json({ success: true });
    } catch (error) {
      console.error("Change password error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
};

// Verify token helper for SDK
export const verifyToken = async (token: string) => {
  try {
    const payload = verify(token, JWT_SECRET) as any;
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
