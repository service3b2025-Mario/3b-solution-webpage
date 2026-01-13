/**
 * WhatsApp Team Accounts API Routes
 * 
 * TRPC routes for managing WhatsApp team accounts
 * and tracking click analytics
 */

import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../_core/trpc";
import * as whatsappDb from "./whatsappDb";

export const whatsappRouter = router({
  // Public: Get active WhatsApp accounts for a specific page
  getActiveAccounts: publicProcedure
    .input(z.object({
      page: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      return whatsappDb.getActiveAccounts(input?.page);
    }),

  // Public: Track a WhatsApp click
  trackClick: publicProcedure
    .input(z.object({
      accountId: z.number(),
      pagePath: z.string().optional(),
      pageTitle: z.string().optional(),
      propertyId: z.number().optional(),
      visitorId: z.string().optional(),
      userAgent: z.string().optional(),
      referrer: z.string().optional(),
      utmSource: z.string().optional(),
      utmMedium: z.string().optional(),
      utmCampaign: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return whatsappDb.trackClick(input);
    }),

  // Admin: List all WhatsApp accounts
  list: adminProcedure
    .query(async () => {
      return whatsappDb.getAllAccounts();
    }),

  // Admin: Get single account
  get: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return whatsappDb.getAccountById(input.id);
    }),

  // Admin: Create new WhatsApp account
  create: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      role: z.string().min(1),
      title: z.string().optional(),
      phoneNumber: z.string().min(1),
      countryCode: z.string().default("+49"),
      displayOrder: z.number().default(0),
      isActive: z.boolean().default(true),
      isVisible: z.boolean().default(true),
      avatarUrl: z.string().optional(),
      teamMemberId: z.number().optional(),
      defaultMessage: z.string().optional(),
      visibleOnPages: z.array(z.string()).default(["contact", "team", "about", "property"]),
    }))
    .mutation(async ({ input }) => {
      return whatsappDb.createAccount({
        ...input,
        visibleOnPages: JSON.stringify(input.visibleOnPages),
      });
    }),

  // Admin: Update WhatsApp account
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        name: z.string().optional(),
        role: z.string().optional(),
        title: z.string().optional(),
        phoneNumber: z.string().optional(),
        countryCode: z.string().optional(),
        displayOrder: z.number().optional(),
        isActive: z.boolean().optional(),
        isVisible: z.boolean().optional(),
        avatarUrl: z.string().optional(),
        teamMemberId: z.number().optional(),
        defaultMessage: z.string().optional(),
        visibleOnPages: z.array(z.string()).optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      const updateData = {
        ...input.data,
        visibleOnPages: input.data.visibleOnPages 
          ? JSON.stringify(input.data.visibleOnPages) 
          : undefined,
      };
      return whatsappDb.updateAccount(input.id, updateData);
    }),

  // Admin: Delete WhatsApp account
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return whatsappDb.deleteAccount(input.id);
    }),

  // Admin: Get click analytics
  getAnalytics: adminProcedure
    .input(z.object({
      accountId: z.number().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      return whatsappDb.getClickAnalytics(input);
    }),

  // Admin: Get click history
  getClickHistory: adminProcedure
    .input(z.object({
      accountId: z.number().optional(),
      limit: z.number().default(100),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ input }) => {
      return whatsappDb.getClickHistory(input);
    }),
});
