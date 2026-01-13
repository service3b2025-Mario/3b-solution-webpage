/**
 * WhatsApp Team Accounts Schema
 * 
 * Database schema for managing team WhatsApp accounts
 * with visibility settings and click tracking
 * 
 * Uses MySQL/TiDB compatible types
 */
import { int, mysqlTable, text, boolean, timestamp, varchar } from "drizzle-orm/mysql-core";

// WhatsApp Team Accounts Table
export const whatsappAccounts = mysqlTable("whatsapp_accounts", {
  id: int("id").autoincrement().primaryKey(),
  
  // Team member info
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(), // CEO, President, Director, etc.
  title: varchar("title", { length: 255 }), // e.g., "Sales", "Support"
  
  // WhatsApp details
  phoneNumber: varchar("phone_number", { length: 50 }).notNull(),
  countryCode: varchar("country_code", { length: 10 }).notNull().default("+49"),
  
  // Display settings
  displayOrder: int("display_order").default(0),
  isActive: boolean("is_active").default(true),
  isVisible: boolean("is_visible").default(true), // Show on website
  
  // Avatar/Photo (optional - can link to team member)
  avatarUrl: text("avatar_url"),
  teamMemberId: int("team_member_id"), // Link to existing team members table
  
  // Default message template
  defaultMessage: text("default_message"),
  
  // Page visibility settings (JSON array of page paths)
  visibleOnPages: text("visible_on_pages"),
  
  // Tracking
  totalClicks: int("total_clicks").default(0),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// WhatsApp Click Tracking Table
export const whatsappClicks = mysqlTable("whatsapp_clicks", {
  id: int("id").autoincrement().primaryKey(),
  
  // Which account was clicked
  accountId: int("account_id").notNull(),
  
  // Click context
  pagePath: varchar("page_path", { length: 255 }),
  pageTitle: varchar("page_title", { length: 255 }),
  propertyId: int("property_id"), // If clicked from property page
  
  // Visitor info (anonymous)
  visitorId: varchar("visitor_id", { length: 100 }), // Anonymous session ID
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  
  // UTM tracking
  utmSource: varchar("utm_source", { length: 100 }),
  utmMedium: varchar("utm_medium", { length: 100 }),
  utmCampaign: varchar("utm_campaign", { length: 100 }),
  
  // Timestamp
  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
});

// Type exports
export type WhatsAppAccount = typeof whatsappAccounts.$inferSelect;
export type InsertWhatsAppAccount = typeof whatsappAccounts.$inferInsert;
export type WhatsAppClick = typeof whatsappClicks.$inferSelect;
export type InsertWhatsAppClick = typeof whatsappClicks.$inferInsert;
