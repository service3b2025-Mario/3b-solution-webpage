import { eq, desc, and, isNull, gt, sql } from "drizzle-orm";
import { getDb } from "./db";
import { 
  users, User, InsertUser,
  userSessions, UserSession, InsertUserSession,
  auditLogs, AuditLog, InsertAuditLog
} from "../drizzle/schema";
import { createHash, randomBytes } from "crypto";
import * as argon2 from "argon2";

// User Role Types
export type UserRole = "user" | "Admin" | "Director" | "DataEditor" | "PropertySpecialist" | "SalesSpecialist";

// Permission definitions for each role
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  user: [],
  Admin: [
    "user:read", "user:create", "user:update", "user:delete",
    "settings:read", "settings:update",
    "api:read", "api:update",
    "dashboard:read", "dashboard:update",
    "crm:read", "crm:update",
    "property:read", "property:create", "property:update", "property:delete",
    "lead:read", "lead:create", "lead:update", "lead:delete",
    "booking:read", "booking:create", "booking:update", "booking:delete",
    "content:read", "content:create", "content:update", "content:delete",
    "team:read", "team:create", "team:update", "team:delete",
    "story:read", "story:create", "story:update", "story:delete",
    "audit:read"
  ],
  Director: [
    "dashboard:read", "dashboard:update",
    "crm:read", "crm:update",
    "property:read", "property:create", "property:update", "property:delete",
    "lead:read", "lead:create", "lead:update", "lead:delete",
    "booking:read", "booking:create", "booking:update", "booking:delete",
    "content:read", "content:create", "content:update", "content:delete",
    "team:read", "team:create", "team:update", "team:delete",
    "story:read", "story:create", "story:update", "story:delete"
  ],
  DataEditor: [
    "dashboard:read",
    "content:read", "content:create", "content:update", "content:delete",
    "team:read", "team:create", "team:update", "team:delete",
    "story:read", "story:create", "story:update", "story:delete"
  ],
  PropertySpecialist: [
    "dashboard:read",
    "crm:read",
    "property:read", "property:create", "property:update", "property:delete",
    "lead:read",
    "booking:read",
    "content:read",
    "team:read",
    "story:read"
  ],
  SalesSpecialist: [
    "dashboard:read",
    "crm:read",
    "property:read",
    "lead:read", "lead:update",
    "booking:read", "booking:update"
  ]
};

// Check if a role has a specific permission
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

// Check if a role has any of the specified permissions
export function hasAnyPermission(role: UserRole, permissions: string[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

// Password hashing using Argon2
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4
  });
}

// Verify password
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

// Generate a unique openId for new users
export function generateOpenId(): string {
  return `user_${randomBytes(16).toString('hex')}`;
}

// Generate a session token
export function generateSessionToken(): string {
  return randomBytes(64).toString('hex');
}

// ==================== USER CRUD OPERATIONS ====================

// Get all users (for admin panel)
export async function getAllUsers(): Promise<User[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

// Get user by ID
export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

// Create a new user
export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdBy?: number;
}): Promise<User> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if email already exists
  const existing = await getUserByEmail(data.email);
  if (existing) {
    throw new Error("A user with this email already exists");
  }

  const openId = generateOpenId();
  const passwordHash = await hashPassword(data.password);

  const insertData: InsertUser = {
    openId,
    name: data.name,
    email: data.email,
    passwordHash,
    role: data.role,
    loginMethod: "email",
    isActive: true,
    lastPasswordChange: new Date(),
    createdBy: data.createdBy,
  };

  await db.insert(users).values(insertData);
  
  const newUser = await getUserByEmail(data.email);
  if (!newUser) throw new Error("Failed to create user");
  
  return newUser;
}

// Update user
export async function updateUser(id: number, data: {
  name?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  // If email is being changed, check for duplicates
  if (data.email) {
    const existing = await getUserByEmail(data.email);
    if (existing && existing.id !== id) {
      throw new Error("A user with this email already exists");
    }
  }

  const updateData: Partial<InsertUser> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  await db.update(users).set(updateData).where(eq(users.id, id));
  
  return getUserById(id);
}

// Reset user password
export async function resetUserPassword(id: number, newPassword: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const passwordHash = await hashPassword(newPassword);
  
  await db.update(users).set({
    passwordHash,
    lastPasswordChange: new Date(),
    failedLoginAttempts: 0,
    lockedUntil: null
  }).where(eq(users.id, id));
}

// Delete user (soft delete by deactivating)
export async function deleteUser(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  // Soft delete - just deactivate
  await db.update(users).set({ isActive: false }).where(eq(users.id, id));
  
  // Revoke all sessions
  await revokeAllUserSessions(id);
}

// Hard delete user (permanent)
export async function hardDeleteUser(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  // Revoke all sessions first
  await revokeAllUserSessions(id);
  
  // Delete user
  await db.delete(users).where(eq(users.id, id));
}

// ==================== SESSION MANAGEMENT ====================

// Create a new session
export async function createSession(userId: number, ipAddress?: string, userAgent?: string): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours

  const sessionData: InsertUserSession = {
    userId,
    sessionToken,
    ipAddress,
    userAgent,
    expiresAt,
  };

  await db.insert(userSessions).values(sessionData);
  
  return sessionToken;
}

// Validate session
export async function validateSession(sessionToken: string): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;

  const sessions = await db.select()
    .from(userSessions)
    .where(
      and(
        eq(userSessions.sessionToken, sessionToken),
        eq(userSessions.isRevoked, false),
        gt(userSessions.expiresAt, new Date())
      )
    )
    .limit(1);

  if (sessions.length === 0) return null;

  const session = sessions[0];
  
  // Update last activity
  await db.update(userSessions)
    .set({ lastActivityAt: new Date() })
    .where(eq(userSessions.id, session.id));

  // Get user
  const user = await getUserById(session.userId);
  if (!user || !user.isActive) return null;

  return user;
}

// Revoke a specific session
export async function revokeSession(sessionToken: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(userSessions)
    .set({ isRevoked: true })
    .where(eq(userSessions.sessionToken, sessionToken));
}

// Revoke all sessions for a user
export async function revokeAllUserSessions(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(userSessions)
    .set({ isRevoked: true })
    .where(eq(userSessions.userId, userId));
}

// Get active sessions for a user
export async function getUserSessions(userId: number): Promise<UserSession[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(userSessions)
    .where(
      and(
        eq(userSessions.userId, userId),
        eq(userSessions.isRevoked, false),
        gt(userSessions.expiresAt, new Date())
      )
    )
    .orderBy(desc(userSessions.lastActivityAt));
}

// ==================== LOGIN HANDLING ====================

// Handle login attempt
export async function handleLogin(email: string, password: string, ipAddress?: string, userAgent?: string): Promise<{ success: boolean; user?: User; sessionToken?: string; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  const user = await getUserByEmail(email);
  
  if (!user) {
    return { success: false, error: "Invalid email or password" };
  }

  // Check if account is locked
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return { success: false, error: `Account is locked. Try again in ${minutesLeft} minutes.` };
  }

  // Check if account is active
  if (!user.isActive) {
    return { success: false, error: "Account is deactivated. Contact an administrator." };
  }

  // Check if user has a password set
  if (!user.passwordHash) {
    return { success: false, error: "Invalid email or password" };
  }

  // Verify password
  const isValid = await verifyPassword(user.passwordHash, password);
  
  if (!isValid) {
    // Increment failed attempts
    const newAttempts = (user.failedLoginAttempts || 0) + 1;
    const updateData: Partial<InsertUser> = { failedLoginAttempts: newAttempts };
    
    // Lock account after 5 failed attempts
    if (newAttempts >= 5) {
      updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    }
    
    await db.update(users).set(updateData).where(eq(users.id, user.id));
    
    return { success: false, error: "Invalid email or password" };
  }

  // Reset failed attempts on successful login
  await db.update(users).set({
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastSignedIn: new Date()
  }).where(eq(users.id, user.id));

  // Create session
  const sessionToken = await createSession(user.id, ipAddress, userAgent);

  return { success: true, user, sessionToken };
}

// ==================== AUDIT LOGGING ====================

// Log an action
export async function logAuditAction(data: {
  userId?: number;
  userEmail?: string;
  action: string;
  entityType?: string;
  entityId?: number;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const logData: InsertAuditLog = {
    userId: data.userId,
    userEmail: data.userEmail,
    action: data.action,
    entityType: data.entityType,
    entityId: data.entityId,
    details: data.details,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
  };

  await db.insert(auditLogs).values(logData);
}

// Get audit logs
export async function getAuditLogs(filters?: {
  userId?: number;
  action?: string;
  entityType?: string;
  limit?: number;
  offset?: number;
}): Promise<AuditLog[]> {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(auditLogs);
  
  const conditions = [];
  if (filters?.userId) conditions.push(eq(auditLogs.userId, filters.userId));
  if (filters?.action) conditions.push(eq(auditLogs.action, filters.action));
  if (filters?.entityType) conditions.push(eq(auditLogs.entityType, filters.entityType));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  query = query.orderBy(desc(auditLogs.createdAt)) as any;
  
  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return query;
}
