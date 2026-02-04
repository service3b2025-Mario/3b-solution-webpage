import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { adminUsers, adminAuditLog } from "../drizzle/schema";
import { db } from "./db";
import { eq, desc, and, gt } from "drizzle-orm";
import * as argon2 from "argon2";

// Password validation schema
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

// Role type
const roleSchema = z.enum(["admin", "director", "dataEditor", "propertySpecialist", "salesSpecialist"]);

// Helper to check if current user is admin
const requireAdmin = (userRole: string | undefined) => {
  if (userRole !== "admin") {
    throw new Error("Only administrators can manage users");
  }
};

// Helper to log audit events
const logAudit = async (
  userId: number,
  userEmail: string,
  action: string,
  resource?: string,
  resourceId?: number,
  details?: string
) => {
  try {
    await db.insert(adminAuditLog).values({
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      details,
    });
  } catch (e) {
    console.error("Failed to log audit event:", e);
  }
};

export const adminUserRouter = router({
  // List all admin users (admin only)
  list: protectedProcedure.query(async ({ ctx }) => {
    requireAdmin(ctx.user?.role);
    
    const users = await db
      .select({
        id: adminUsers.id,
        email: adminUsers.email,
        name: adminUsers.name,
        role: adminUsers.role,
        isActive: adminUsers.isActive,
        mustChangePassword: adminUsers.mustChangePassword,
        failedLoginAttempts: adminUsers.failedLoginAttempts,
        lockedUntil: adminUsers.lockedUntil,
        lastLogin: adminUsers.lastLogin,
        lastPasswordChange: adminUsers.lastPasswordChange,
        createdAt: adminUsers.createdAt,
      })
      .from(adminUsers)
      .orderBy(desc(adminUsers.createdAt));
    
    return users;
  }),

  // Get single user by ID (admin only)
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.user?.role);
      
      const [user] = await db
        .select({
          id: adminUsers.id,
          email: adminUsers.email,
          name: adminUsers.name,
          role: adminUsers.role,
          isActive: adminUsers.isActive,
          mustChangePassword: adminUsers.mustChangePassword,
          lastLogin: adminUsers.lastLogin,
          createdAt: adminUsers.createdAt,
        })
        .from(adminUsers)
        .where(eq(adminUsers.id, input.id));
      
      return user || null;
    }),

  // Create new admin user (admin only)
  create: protectedProcedure
    .input(z.object({
      email: z.string().email("Invalid email address"),
      name: z.string().min(2, "Name must be at least 2 characters"),
      password: passwordSchema,
      role: roleSchema,
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user?.role);
      
      // Check if email already exists
      const [existing] = await db
        .select({ id: adminUsers.id })
        .from(adminUsers)
        .where(eq(adminUsers.email, input.email.toLowerCase()));
      
      if (existing) {
        throw new Error("A user with this email already exists");
      }
      
      // Hash password
      const passwordHash = await argon2.hash(input.password);
      
      // Create user
      const [result] = await db.insert(adminUsers).values({
        email: input.email.toLowerCase(),
        name: input.name,
        passwordHash,
        role: input.role,
        isActive: input.isActive,
        mustChangePassword: true, // Force password change on first login
        createdBy: ctx.user?.id,
      });
      
      await logAudit(
        ctx.user?.id || 0,
        ctx.user?.email || "unknown",
        "CREATE_USER",
        "adminUsers",
        result.insertId,
        `Created user: ${input.email} with role: ${input.role}`
      );
      
      return { success: true, id: result.insertId };
    }),

  // Update admin user (admin only)
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      email: z.string().email("Invalid email address").optional(),
      name: z.string().min(2).optional(),
      role: roleSchema.optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user?.role);
      
      const { id, ...updates } = input;
      
      // Check if user exists
      const [existing] = await db
        .select({ id: adminUsers.id, email: adminUsers.email })
        .from(adminUsers)
        .where(eq(adminUsers.id, id));
      
      if (!existing) {
        throw new Error("User not found");
      }
      
      // If email is being changed, check for duplicates
      if (updates.email && updates.email.toLowerCase() !== existing.email) {
        const [duplicate] = await db
          .select({ id: adminUsers.id })
          .from(adminUsers)
          .where(eq(adminUsers.email, updates.email.toLowerCase()));
        
        if (duplicate) {
          throw new Error("A user with this email already exists");
        }
        updates.email = updates.email.toLowerCase();
      }
      
      await db.update(adminUsers).set(updates).where(eq(adminUsers.id, id));
      
      await logAudit(
        ctx.user?.id || 0,
        ctx.user?.email || "unknown",
        "UPDATE_USER",
        "adminUsers",
        id,
        `Updated user: ${existing.email}`
      );
      
      return { success: true };
    }),

  // Delete admin user (admin only)
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user?.role);
      
      // Prevent self-deletion
      if (ctx.user?.id === input.id) {
        throw new Error("You cannot delete your own account");
      }
      
      const [existing] = await db
        .select({ email: adminUsers.email })
        .from(adminUsers)
        .where(eq(adminUsers.id, input.id));
      
      if (!existing) {
        throw new Error("User not found");
      }
      
      await db.delete(adminUsers).where(eq(adminUsers.id, input.id));
      
      await logAudit(
        ctx.user?.id || 0,
        ctx.user?.email || "unknown",
        "DELETE_USER",
        "adminUsers",
        input.id,
        `Deleted user: ${existing.email}`
      );
      
      return { success: true };
    }),

  // Reset password (admin only - sets temporary password)
  resetPassword: protectedProcedure
    .input(z.object({
      id: z.number(),
      newPassword: passwordSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user?.role);
      
      const [existing] = await db
        .select({ email: adminUsers.email })
        .from(adminUsers)
        .where(eq(adminUsers.id, input.id));
      
      if (!existing) {
        throw new Error("User not found");
      }
      
      const passwordHash = await argon2.hash(input.newPassword);
      
      await db.update(adminUsers).set({
        passwordHash,
        mustChangePassword: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
      }).where(eq(adminUsers.id, input.id));
      
      await logAudit(
        ctx.user?.id || 0,
        ctx.user?.email || "unknown",
        "RESET_PASSWORD",
        "adminUsers",
        input.id,
        `Reset password for user: ${existing.email}`
      );
      
      return { success: true };
    }),

  // Change own password (any authenticated user)
  changeOwnPassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string(),
      newPassword: passwordSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) {
        throw new Error("Not authenticated");
      }
      
      const [user] = await db
        .select({ id: adminUsers.id, passwordHash: adminUsers.passwordHash })
        .from(adminUsers)
        .where(eq(adminUsers.id, ctx.user.id));
      
      if (!user) {
        throw new Error("User not found");
      }
      
      // Verify current password
      const isValid = await argon2.verify(user.passwordHash, input.currentPassword);
      if (!isValid) {
        throw new Error("Current password is incorrect");
      }
      
      // Hash and save new password
      const passwordHash = await argon2.hash(input.newPassword);
      
      await db.update(adminUsers).set({
        passwordHash,
        mustChangePassword: false,
        lastPasswordChange: new Date(),
      }).where(eq(adminUsers.id, ctx.user.id));
      
      await logAudit(
        ctx.user.id,
        ctx.user.email || "unknown",
        "CHANGE_OWN_PASSWORD",
        "adminUsers",
        ctx.user.id,
        "User changed their own password"
      );
      
      return { success: true };
    }),

  // Unlock user account (admin only)
  unlockAccount: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user?.role);
      
      await db.update(adminUsers).set({
        failedLoginAttempts: 0,
        lockedUntil: null,
      }).where(eq(adminUsers.id, input.id));
      
      await logAudit(
        ctx.user?.id || 0,
        ctx.user?.email || "unknown",
        "UNLOCK_ACCOUNT",
        "adminUsers",
        input.id,
        "Unlocked user account"
      );
      
      return { success: true };
    }),

  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.id) {
      return null;
    }
    
    const [user] = await db
      .select({
        id: adminUsers.id,
        email: adminUsers.email,
        name: adminUsers.name,
        role: adminUsers.role,
        mustChangePassword: adminUsers.mustChangePassword,
        lastLogin: adminUsers.lastLogin,
        lastPasswordChange: adminUsers.lastPasswordChange,
      })
      .from(adminUsers)
      .where(eq(adminUsers.id, ctx.user.id));
    
    return user || null;
  }),

  // Get audit log (admin only)
  getAuditLog: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.user?.role);
      
      const logs = await db
        .select()
        .from(adminAuditLog)
        .orderBy(desc(adminAuditLog.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      
      return logs;
    }),
});
