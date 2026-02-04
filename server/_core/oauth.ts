import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { getDb } from "../db";
import { adminUsers } from "../../drizzle/schema";
import { eq, and, or, isNull, lt } from "drizzle-orm";
import crypto from "crypto";

// Password hashing using Node.js built-in crypto (no external dependencies )
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
export const COOKIE_NAME = "admin_session";

// Create Hono app for OAuth routes
const oauthApp = new Hono();

// Login endpoint
oauthApp.post("/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const db = await getDb();
    
    // Check for legacy admin first
    if (email === LEGACY_ADMIN_EMAIL && password === LEGACY_ADMIN_PASSWORD) {
      const token = await sign(
        {
          sub: "0",
          email: LEGACY_ADMIN_EMAIL,
          name: LEGACY_ADMIN_NAME,
          role: "admin",
          mustChangePassword: false,
          exp: Math.floor(Date.now() / 1000) + SESSION_DURATION,
        },
        JWT_SECRET
      );

      setCookie(c, COOKIE_NAME, token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: SESSION_DURATION,
      } );

      return c.json({
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
      return c.json({ error: "Database not available" }, 500);
    }

    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email))
      .limit(1);

    if (!user) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return c.json({ error: "Account is locked. Please try again later." }, 423);
    }

    // Check if account is active
    if (!user.isActive) {
      return c.json({ error: "Account is disabled" }, 403);
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

      return c.json({ error: "Invalid email or password" }, 401);
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
    const token = await sign(
      {
        sub: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        exp: Math.floor(Date.now() / 1000) + SESSION_DURATION,
      },
      JWT_SECRET
    );

    setCookie(c, COOKIE_NAME, token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: SESSION_DURATION,
    } );

    return c.json({
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
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Logout endpoint
oauthApp.post("/logout", async (c) => {
  deleteCookie(c, COOKIE_NAME, { path: "/" });
  return c.json({ success: true });
});

// Get current user endpoint
oauthApp.get("/me", async (c) => {
  try {
    const token = getCookie(c, COOKIE_NAME);
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
    deleteCookie(c, COOKIE_NAME, { path: "/" });
    return c.json({ user: null });
  }
});

// Change password endpoint
oauthApp.post("/change-password", async (c) => {
  try {
    const token = getCookie(c, COOKIE_NAME);
    if (!token) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    const payload = await verify(token, JWT_SECRET);
    if (!payload || !payload.sub) {
      return c.json({ error: "Invalid session" }, 401);
    }

    const { currentPassword, newPassword } = await c.req.json();

    if (!currentPassword || !newPassword) {
      return c.json({ error: "Current and new password are required" }, 400);
    }

    if (newPassword.length < 8) {
      return c.json({ error: "New password must be at least 8 characters" }, 400);
    }

    const db = await getDb();
    if (!db) {
      return c.json({ error: "Database not available" }, 500);
    }

    const userId = parseInt(payload.sub as string);
    
    // Handle legacy admin
    if (userId === 0) {
      if (currentPassword !== LEGACY_ADMIN_PASSWORD) {
        return c.json({ error: "Current password is incorrect" }, 401);
      }
      return c.json({ error: "Cannot change password for legacy admin" }, 400);
    }

    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, userId))
      .limit(1);

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      return c.json({ error: "Current password is incorrect" }, 401);
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

    return c.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return c.json({ error: "Internal server error" }, 500);
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

// Register OAuth routes helper
export const registerOAuthRoutes = (app: Hono) => {
  app.route("/api/auth", oauthApp);
};

export default oauthApp;
