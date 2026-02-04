import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { db } from "../db";
import { adminUsers } from "../../drizzle/schema";
import { eq, and, or, isNull, lt } from "drizzle-orm";
import crypto from "crypto";

// Password hashing using Node.js built-in crypto (no external dependencies)
const hashPassword = async (password: string): Promise<string> => {
  const salt = crypto.randomBytes(32).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
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
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export const oauthApp = new Hono();

// Export hash function for use in adminUserRouters
export { hashPassword, verifyPassword };

// Helper to create JWT token
const createToken = async (user: {
  id: number;
  email: string;
  name: string;
  role: string;
  mustChangePassword?: boolean;
}) => {
  const payload = {
    sub: user.id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    mustChangePassword: user.mustChangePassword || false,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION,
  };
  return await sign(payload, JWT_SECRET);
};

// Login endpoint
oauthApp.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ success: false, error: "Email and password are required" }, 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // First, try database user
    let dbUser = null;
    try {
      const [user] = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.email, normalizedEmail));
      dbUser = user;
    } catch (e) {
      // Database table might not exist yet, continue to legacy check
      console.log("Database user lookup failed, trying legacy auth");
    }

    if (dbUser) {
      // Check if account is locked
      if (dbUser.lockedUntil && new Date(dbUser.lockedUntil) > new Date()) {
        const remainingMinutes = Math.ceil((new Date(dbUser.lockedUntil).getTime() - Date.now()) / 60000);
        return c.json({
          success: false,
          error: `Account is locked. Try again in ${remainingMinutes} minutes.`,
        }, 403);
      }

      // Check if account is active
      if (!dbUser.isActive) {
        return c.json({ success: false, error: "Account is deactivated. Contact administrator." }, 403);
      }

      // Verify password using our crypto-based function
      const isValid = await verifyPassword(password, dbUser.passwordHash);

      if (!isValid) {
        // Increment failed attempts
        const newAttempts = (dbUser.failedLoginAttempts || 0) + 1;
        const updates: any = { failedLoginAttempts: newAttempts };

        if (newAttempts >= MAX_FAILED_ATTEMPTS) {
          updates.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
        }

        await db.update(adminUsers).set(updates).where(eq(adminUsers.id, dbUser.id));

        const attemptsLeft = MAX_FAILED_ATTEMPTS - newAttempts;
        if (attemptsLeft > 0) {
          return c.json({
            success: false,
            error: `Invalid password. ${attemptsLeft} attempts remaining.`,
          }, 401);
        } else {
          return c.json({
            success: false,
            error: "Account locked due to too many failed attempts. Try again in 15 minutes.",
          }, 403);
        }
      }

      // Successful login - reset failed attempts and update last login
      await db.update(adminUsers).set({
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      }).where(eq(adminUsers.id, dbUser.id));

      // Create token
      const token = await createToken({
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        mustChangePassword: dbUser.mustChangePassword,
      });

      // Set cookie
      setCookie(c, "app_session_id", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: SESSION_DURATION,
        path: "/",
      });

      return c.json({
        success: true,
        redirectUrl: dbUser.mustChangePassword ? "/admin/change-password" : "/admin",
        user: {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          mustChangePassword: dbUser.mustChangePassword,
        },
      });
    }

    // Fallback to legacy admin credentials
    if (normalizedEmail === LEGACY_ADMIN_EMAIL.toLowerCase() && password === LEGACY_ADMIN_PASSWORD) {
      const token = await createToken({
        id: 0, // Legacy user ID
        email: LEGACY_ADMIN_EMAIL,
        name: LEGACY_ADMIN_NAME,
        role: "admin",
        mustChangePassword: false,
      });

      setCookie(c, "app_session_id", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: SESSION_DURATION,
        path: "/",
      });

      return c.json({
        success: true,
        redirectUrl: "/admin",
        user: {
          id: 0,
          email: LEGACY_ADMIN_EMAIL,
          name: LEGACY_ADMIN_NAME,
          role: "admin",
          mustChangePassword: false,
        },
      });
    }

    return c.json({ success: false, error: "Invalid email or password" }, 401);
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ success: false, error: "Login failed. Please try again." }, 500);
  }
});

// Logout endpoint
oauthApp.post("/logout", async (c) => {
  deleteCookie(c, "app_session_id", { path: "/" });
  return c.json({ success: true });
});

// Get current user endpoint
oauthApp.get("/me", async (c) => {
  try {
    const token = getCookie(c, "app_session_id");
    if (!token) {
      return c.json({ user: null });
    }

    const payload = await verify(token, JWT_SECRET);
    if (!payload || !payload.sub) {
      return c.json({ user: null });
    }

    return c.json({
      user: {
        id: parseInt(payload.sub as string),
        email: payload.email,
        name: payload.name,
        role: payload.role,
        mustChangePassword: payload.mustChangePassword,
      },
    });
  } catch (error) {
    deleteCookie(c, "app_session_id", { path: "/" });
    return c.json({ user: null });
  }
});

// Verify token helper for SDK
export const verifyToken = async (token: string) => {
  try {
    const payload = await verify(token, JWT_SECRET);
    if (!payload || !payload.sub) {
      return null;
    }
    return {
      id: parseInt(payload.sub as string),
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
      mustChangePassword: payload.mustChangePassword as boolean,
    };
  } catch {
    return null;
  }
};

export default oauthApp;
