import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import * as userMgmt from "./userManagement";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";

// Role enum for validation
const roleEnum = z.enum(["user", "Admin", "Director", "DataEditor", "PropertySpecialist", "SalesSpecialist"]);

// Admin-only procedure - only Admin role can manage users
const adminOnlyProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'Admin' && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Only administrators can manage users' });
  }
  return next({ ctx });
});

// Permission-based procedure factory
export function createPermissionProcedure(requiredPermission: string) {
  return protectedProcedure.use(({ ctx, next }) => {
    const role = ctx.user.role as userMgmt.UserRole;
    if (!userMgmt.hasPermission(role, requiredPermission)) {
      throw new TRPCError({ 
        code: 'FORBIDDEN', 
        message: `You don't have permission to perform this action (requires: ${requiredPermission})` 
      });
    }
    return next({ ctx });
  });
}

export const userRouter = router({
  // Get all users (admin only)
  list: adminOnlyProcedure.query(async () => {
    const users = await userMgmt.getAllUsers();
    // Remove sensitive fields
    return users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      mfaEnabled: u.mfaEnabled,
      lastSignedIn: u.lastSignedIn,
      createdAt: u.createdAt,
      failedLoginAttempts: u.failedLoginAttempts,
      lockedUntil: u.lockedUntil,
    }));
  }),

  // Get single user by ID (admin only)
  getById: adminOnlyProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const user = await userMgmt.getUserById(input);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        mfaEnabled: user.mfaEnabled,
        lastSignedIn: user.lastSignedIn,
        createdAt: user.createdAt,
        lastPasswordChange: user.lastPasswordChange,
      };
    }),

  // Create new user (admin only)
  create: adminOnlyProcedure
    .input(z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(12, "Password must be at least 12 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
      role: roleEnum,
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await userMgmt.createUser({
          name: input.name,
          email: input.email,
          password: input.password,
          role: input.role as userMgmt.UserRole,
          createdBy: ctx.user.id,
        });

        // Log the action
        await userMgmt.logAuditAction({
          userId: ctx.user.id,
          userEmail: ctx.user.email || undefined,
          action: 'user_created',
          entityType: 'user',
          entityId: user.id,
          details: { 
            newUserEmail: input.email, 
            newUserRole: input.role,
            createdByName: ctx.user.name 
          },
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.headers['user-agent'],
        });

        return { success: true, userId: user.id };
      } catch (error) {
        throw new TRPCError({ 
          code: 'BAD_REQUEST', 
          message: error instanceof Error ? error.message : 'Failed to create user' 
        });
      }
    }),

  // Update user (admin only)
  update: adminOnlyProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      role: roleEnum.optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Prevent admin from deactivating themselves
      if (input.id === ctx.user.id && input.isActive === false) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'You cannot deactivate your own account' });
      }

      // Prevent admin from changing their own role
      if (input.id === ctx.user.id && input.role && input.role !== ctx.user.role) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'You cannot change your own role' });
      }

      try {
        const user = await userMgmt.updateUser(input.id, {
          name: input.name,
          email: input.email,
          role: input.role as userMgmt.UserRole | undefined,
          isActive: input.isActive,
        });

        // Log the action
        await userMgmt.logAuditAction({
          userId: ctx.user.id,
          userEmail: ctx.user.email || undefined,
          action: 'user_updated',
          entityType: 'user',
          entityId: input.id,
          details: { changes: input },
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.headers['user-agent'],
        });

        return { success: true, user };
      } catch (error) {
        throw new TRPCError({ 
          code: 'BAD_REQUEST', 
          message: error instanceof Error ? error.message : 'Failed to update user' 
        });
      }
    }),

  // Reset user password (admin only)
  resetPassword: adminOnlyProcedure
    .input(z.object({
      id: z.number(),
      newPassword: z.string().min(12, "Password must be at least 12 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    }))
    .mutation(async ({ input, ctx }) => {
      await userMgmt.resetUserPassword(input.id, input.newPassword);

      // Log the action
      await userMgmt.logAuditAction({
        userId: ctx.user.id,
        userEmail: ctx.user.email || undefined,
        action: 'password_reset',
        entityType: 'user',
        entityId: input.id,
        details: { resetBy: ctx.user.name },
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.headers['user-agent'],
      });

      // Revoke all sessions for the user
      await userMgmt.revokeAllUserSessions(input.id);

      return { success: true };
    }),

  // Delete user (admin only) - soft delete
  delete: adminOnlyProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      // Prevent admin from deleting themselves
      if (input === ctx.user.id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'You cannot delete your own account' });
      }

      await userMgmt.deleteUser(input);

      // Log the action
      await userMgmt.logAuditAction({
        userId: ctx.user.id,
        userEmail: ctx.user.email || undefined,
        action: 'user_deleted',
        entityType: 'user',
        entityId: input,
        details: { deletedBy: ctx.user.name },
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.headers['user-agent'],
      });

      return { success: true };
    }),

  // Force logout user (admin only)
  forceLogout: adminOnlyProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      await userMgmt.revokeAllUserSessions(input);

      // Log the action
      await userMgmt.logAuditAction({
        userId: ctx.user.id,
        userEmail: ctx.user.email || undefined,
        action: 'force_logout',
        entityType: 'user',
        entityId: input,
        details: { forcedBy: ctx.user.name },
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.headers['user-agent'],
      });

      return { success: true };
    }),

  // Get user's active sessions (admin only)
  getSessions: adminOnlyProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return userMgmt.getUserSessions(input);
    }),

  // Get audit logs (admin only)
  getAuditLogs: adminOnlyProcedure
    .input(z.object({
      userId: z.number().optional(),
      action: z.string().optional(),
      entityType: z.string().optional(),
      limit: z.number().optional().default(100),
      offset: z.number().optional().default(0),
    }).optional())
    .query(async ({ input }) => {
      return userMgmt.getAuditLogs(input);
    }),

  // Get available roles (for dropdowns)
  getRoles: protectedProcedure.query(() => {
    return [
      { value: 'Admin', label: 'Admin', description: 'Full system access' },
      { value: 'Director', label: 'Director', description: 'Strategic oversight with full CRUD on most sections' },
      { value: 'DataEditor', label: 'Data Editor', description: 'Content, team, and stories management' },
      { value: 'PropertySpecialist', label: 'Property Specialist', description: 'Property management with read access to leads' },
      { value: 'SalesSpecialist', label: 'Sales Specialist', description: 'Leads and bookings management' },
    ];
  }),

  // Get current user's permissions
  getMyPermissions: protectedProcedure.query(({ ctx }) => {
    const role = ctx.user.role as userMgmt.UserRole;
    return {
      role,
      permissions: userMgmt.ROLE_PERMISSIONS[role] || [],
    };
  }),

  // Check if current user has a specific permission
  hasPermission: protectedProcedure
    .input(z.string())
    .query(({ input, ctx }) => {
      const role = ctx.user.role as userMgmt.UserRole;
      return userMgmt.hasPermission(role, input);
    }),
});

export type UserRouter = typeof userRouter;
