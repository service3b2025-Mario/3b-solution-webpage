import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "./_core/trpc";
import { db } from "./db";
import { adminUsers } from "../drizzle/schema";
import { eq, ne, and, desc } from "drizzle-orm";
import { hashPassword } from "./_core/oauth";

// Admin procedure - requires admin role
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const adminUserRouter = router({
  // List all admin users
  list: adminProcedure.query(async () => {
    try {
      const users = await db
        .select({
          id: adminUsers.id,
          email: adminUsers.email,
          name: adminUsers.name,
          role: adminUsers.role,
          isActive: adminUsers.isActive,
          mustChangePassword: adminUsers.mustChangePassword,
          lastLogin: adminUsers.lastLogin,
          createdAt: adminUsers.createdAt,
          failedLoginAttempts: adminUsers.failedLoginAttempts,
          lockedUntil: adminUsers.lockedUntil,
        })
        .from(adminUsers)
        .orderBy(desc(adminUsers.createdAt));

      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch users' });
    }
  }),

  // Create new admin user
  create: adminProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().min(1),
      role: z.enum(['admin', 'director', 'dataEditor', 'propertySpecialist', 'salesSpecialist']),
      password: z.string().min(8),
    }))
    .mutation(async ({ input }) => {
      try {
        const { email, name, role, password } = input;

        // Check if email already exists
        const [existing] = await db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.email, email.toLowerCase().trim()));

        if (existing) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Email already exists' });
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const [newUser] = await db
          .insert(adminUsers)
          .values({
            email: email.toLowerCase().trim(),
            name: name.trim(),
            role,
            passwordHash,
            isActive: true,
            mustChangePassword: true,
            failedLoginAttempts: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning({
            id: adminUsers.id,
            email: adminUsers.email,
            name: adminUsers.name,
            role: adminUsers.role,
            isActive: adminUsers.isActive,
            mustChangePassword: adminUsers.mustChangePassword,
            createdAt: adminUsers.createdAt,
          });

        return newUser;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error creating user:", error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create user' });
      }
    }),

  // Update admin user
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      email: z.string().email(),
      name: z.string().min(1),
      role: z.enum(['admin', 'director', 'dataEditor', 'propertySpecialist', 'salesSpecialist']),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const { id, email, name, role, isActive } = input;

        // Check if email already exists for another user
        const [existing] = await db
          .select()
          .from(adminUsers)
          .where(and(
            eq(adminUsers.email, email.toLowerCase().trim()),
            ne(adminUsers.id, id)
          ));

        if (existing) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Email already exists' });
        }

        const [updatedUser] = await db
          .update(adminUsers)
          .set({
            email: email.toLowerCase().trim(),
            name: name.trim(),
            role,
            isActive: isActive !== undefined ? isActive : true,
            updatedAt: new Date(),
          })
          .where(eq(adminUsers.id, id))
          .returning({
            id: adminUsers.id,
            email: adminUsers.email,
            name: adminUsers.name,
            role: adminUsers.role,
            isActive: adminUsers.isActive,
          });

        if (!updatedUser) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }

        return updatedUser;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating user:", error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update user' });
      }
    }),

  // Reset user password
  resetPassword: adminProcedure
    .input(z.object({
      id: z.number(),
      newPassword: z.string().min(8),
    }))
    .mutation(async ({ input }) => {
      try {
        const { id, newPassword } = input;

        const passwordHash = await hashPassword(newPassword);

        const [updatedUser] = await db
          .update(adminUsers)
          .set({
            passwordHash,
            mustChangePassword: true,
            failedLoginAttempts: 0,
            lockedUntil: null,
            updatedAt: new Date(),
          })
          .where(eq(adminUsers.id, id))
          .returning({ id: adminUsers.id });

        if (!updatedUser) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error resetting password:", error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to reset password' });
      }
    }),

  // Unlock user account
  unlock: adminProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      try {
        const { id } = input;

        const [updatedUser] = await db
          .update(adminUsers)
          .set({
            failedLoginAttempts: 0,
            lockedUntil: null,
            updatedAt: new Date(),
          })
          .where(eq(adminUsers.id, id))
          .returning({ id: adminUsers.id });

        if (!updatedUser) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error unlocking account:", error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to unlock account' });
      }
    }),

  // Delete admin user
  delete: adminProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { id } = input;

        // Prevent self-deletion
        if (ctx.user.id === id) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot delete your own account' });
        }

        const [deletedUser] = await db
          .delete(adminUsers)
          .where(eq(adminUsers.id, id))
          .returning({ id: adminUsers.id });

        if (!deletedUser) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error deleting user:", error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete user' });
      }
    }),
});
