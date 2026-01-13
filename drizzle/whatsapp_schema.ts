/**
 * WhatsApp Team Accounts Schema
 * 
 * Database schema for managing team WhatsApp accounts
 * with visibility settings and click tracking
 */

import { pgTable, serial, varchar, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";

// WhatsApp Team Accounts Table
export const whatsappAccounts = pgTable("whatsapp_accounts", {
  id: serial("id").primaryKey(),
  
  // Team member info
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(), // CEO, President, Director, etc.
  title: varchar("title", { length: 255 }), // e.g., "Sales", "Support"
  
  // WhatsApp details
  phoneNumber: varchar("phone_number", { length: 50 }).notNull(),
  countryCode: varchar("country_code", { length: 10 }).notNull().default("+49"),
  
  // Display settings
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  isVisible: boolean("is_visible").default(true), // Show on website
  
  // Avatar/Photo (optional - can link to team member)
  avatarUrl: text("avatar_url"),
  teamMemberId: integer("team_member_id"), // Link to existing team members table
  
  // Default message template
  defaultMessage: text("default_message").default("Hi! I'm interested in learning more about 3B Solution's real estate investment opportunities."),
  
  // Page visibility settings (JSON array of page paths)
  visibleOnPages: text("visible_on_pages").default('["contact", "team", "about", "property"]'),
  
  // Tracking
  totalClicks: integer("total_clicks").default(0),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// WhatsApp Click Tracking Table
export const whatsappClicks = pgTable("whatsapp_clicks", {
  id: serial("id").primaryKey(),
  
  // Which account was clicked
  accountId: integer("account_id").notNull(),
  
  // Click context
  pagePath: varchar("page_path", { length: 255 }),
  pageTitle: varchar("page_title", { length: 255 }),
  propertyId: integer("property_id"), // If clicked from property page
  
  // Visitor info (anonymous)
  visitorId: varchar("visitor_id", { length: 100 }), // Anonymous session ID
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  
  // UTM tracking
  utmSource: varchar("utm_source", { length: 100 }),
  utmMedium: varchar("utm_medium", { length: 100 }),
  utmCampaign: varchar("utm_campaign", { length: 100 }),
  
  // Timestamp
  clickedAt: timestamp("clicked_at").defaultNow(),
});

// Type exports
export type WhatsAppAccount = typeof whatsappAccounts.$inferSelect;
export type InsertWhatsAppAccount = typeof whatsappAccounts.$inferInsert;
export type WhatsAppClick = typeof whatsappClicks.$inferSelect;
export type InsertWhatsAppClick = typeof whatsappClicks.$inferInsert;
