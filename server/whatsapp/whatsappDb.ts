/**
 * WhatsApp Database Operations
 * 
 * Database functions for WhatsApp team account management
 * Uses Drizzle ORM - imports from main schema.ts
 */

import { eq, desc, asc, and, sql } from "drizzle-orm";
import { getDb } from "../db";
import { 
  whatsappAccounts, 
  whatsappClicks, 
  WhatsAppAccount, 
  InsertWhatsAppAccount, 
  WhatsAppClick, 
  InsertWhatsAppClick 
} from "../../drizzle/schema";

// Re-export types for convenience
export type { WhatsAppAccount, InsertWhatsAppAccount, WhatsAppClick, InsertWhatsAppClick };

// Get active WhatsApp accounts for public display
export async function getActiveAccounts(page?: string): Promise<WhatsAppAccount[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    let accounts = await db.select()
      .from(whatsappAccounts)
      .where(and(
        eq(whatsappAccounts.isActive, true),
        eq(whatsappAccounts.isVisible, true)
      ))
      .orderBy(asc(whatsappAccounts.displayOrder), asc(whatsappAccounts.name));

    // Filter by page if specified
    if (page && accounts.length > 0) {
      accounts = accounts.filter(account => {
        try {
          const pages = JSON.parse(account.visibleOnPages || '[]');
          return pages.includes(page) || pages.includes('all');
        } catch {
          return true;
        }
      });
    }

    return accounts;
  } catch (error) {
    console.error('[WhatsApp] Error fetching active accounts:', error);
    return [];
  }
}

// Get all WhatsApp accounts (admin)
export async function getAllAccounts(): Promise<WhatsAppAccount[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select()
      .from(whatsappAccounts)
      .orderBy(asc(whatsappAccounts.displayOrder), asc(whatsappAccounts.name));
  } catch (error) {
    console.error('[WhatsApp] Error fetching all accounts:', error);
    return [];
  }
}

// Get single account by ID
export async function getAccountById(id: number): Promise<WhatsAppAccount | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select()
      .from(whatsappAccounts)
      .where(eq(whatsappAccounts.id, id))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('[WhatsApp] Error fetching account:', error);
    return null;
  }
}

// Create new WhatsApp account
export async function createAccount(data: Partial<InsertWhatsAppAccount>): Promise<WhatsAppAccount | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const insertData: InsertWhatsAppAccount = {
      name: data.name || '',
      role: data.role || '',
      title: data.title || null,
      phoneNumber: data.phoneNumber || '',
      countryCode: data.countryCode || '+49',
      displayOrder: data.displayOrder || 0,
      isActive: data.isActive !== false,
      isVisible: data.isVisible !== false,
      avatarUrl: data.avatarUrl || null,
      teamMemberId: data.teamMemberId || null,
      defaultMessage: data.defaultMessage || "Hi! I'm interested in learning more about 3B Solution's real estate investment opportunities.",
      visibleOnPages: data.visibleOnPages || '["contact", "team", "about", "property"]',
      totalClicks: 0,
    };

    await db.insert(whatsappAccounts).values(insertData);
    
    // Get the last inserted record by querying with the unique combination
    const [lastInserted] = await db.select()
      .from(whatsappAccounts)
      .where(and(
        eq(whatsappAccounts.name, insertData.name),
        eq(whatsappAccounts.phoneNumber, insertData.phoneNumber)
      ))
      .orderBy(desc(whatsappAccounts.id))
      .limit(1);
    
    return lastInserted || null;
  } catch (error) {
    console.error('[WhatsApp] Error creating account:', error);
    throw error;
  }
}

// Update WhatsApp account
export async function updateAccount(id: number, data: Partial<InsertWhatsAppAccount>): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(whatsappAccounts)
      .set(data)
      .where(eq(whatsappAccounts.id, id));
    return true;
  } catch (error) {
    console.error('[WhatsApp] Error updating account:', error);
    return false;
  }
}

// Delete WhatsApp account
export async function deleteAccount(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error('Database connection not available');

  try {
    // First delete any related click records
    await db.delete(whatsappClicks).where(eq(whatsappClicks.accountId, id));
    // Then delete the account
    await db.delete(whatsappAccounts).where(eq(whatsappAccounts.id, id));
    return true;
  } catch (error) {
    console.error('[WhatsApp] Error deleting account:', error);
    throw new Error(`Failed to delete account: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Track WhatsApp click
export async function trackClick(data: Partial<InsertWhatsAppClick>): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Insert click record
    await db.insert(whatsappClicks).values({
      accountId: data.accountId!,
      pagePath: data.pagePath || null,
      pageTitle: data.pageTitle || null,
      propertyId: data.propertyId || null,
      visitorId: data.visitorId || null,
      userAgent: data.userAgent || null,
      referrer: data.referrer || null,
      utmSource: data.utmSource || null,
      utmMedium: data.utmMedium || null,
      utmCampaign: data.utmCampaign || null,
    });

    // Update total clicks on account
    await db.update(whatsappAccounts)
      .set({ totalClicks: sql`${whatsappAccounts.totalClicks} + 1` })
      .where(eq(whatsappAccounts.id, data.accountId!));

    return true;
  } catch (error) {
    console.error('[WhatsApp] Error tracking click:', error);
    return false;
  }
}

// Get click analytics
export async function getClickAnalytics(filters?: {
  accountId?: number;
  startDate?: string;
  endDate?: string;
}): Promise<any> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Total clicks by account
    const byAccount = await db.select({
      id: whatsappAccounts.id,
      name: whatsappAccounts.name,
      role: whatsappAccounts.role,
      totalClicks: whatsappAccounts.totalClicks,
    })
    .from(whatsappAccounts)
    .orderBy(desc(whatsappAccounts.totalClicks));

    // Clicks by page (last 30 days)
    const byPage = await db.execute(sql`
      SELECT page_path, COUNT(*) as clicks
      FROM whatsapp_clicks
      WHERE clicked_at >= NOW() - INTERVAL '30 days'
      GROUP BY page_path
      ORDER BY clicks DESC
      LIMIT 10
    `);

    // Clicks over time (last 30 days)
    const overTime = await db.execute(sql`
      SELECT DATE(clicked_at) as date, COUNT(*) as clicks
      FROM whatsapp_clicks
      WHERE clicked_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(clicked_at)
      ORDER BY date ASC
    `);

    // Total stats
    const totals = await db.execute(sql`
      SELECT 
        COUNT(*) as total_clicks,
        COUNT(DISTINCT visitor_id) as unique_visitors
      FROM whatsapp_clicks
      WHERE clicked_at >= NOW() - INTERVAL '30 days'
    `);

    return {
      byAccount,
      byPage: byPage.rows || byPage || [],
      overTime: overTime.rows || overTime || [],
      totals: (totals.rows || totals || [])[0] || { total_clicks: 0, unique_visitors: 0 },
    };
  } catch (error) {
    console.error('[WhatsApp] Error fetching analytics:', error);
    return null;
  }
}

// Get click history
export async function getClickHistory(filters?: {
  accountId?: number;
  limit?: number;
  offset?: number;
}): Promise<WhatsAppClick[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const limit = filters?.limit || 100;
    const offset = filters?.offset || 0;

    let query = db.select()
      .from(whatsappClicks)
      .orderBy(desc(whatsappClicks.clickedAt))
      .limit(limit)
      .offset(offset);

    if (filters?.accountId) {
      query = db.select()
        .from(whatsappClicks)
        .where(eq(whatsappClicks.accountId, filters.accountId))
        .orderBy(desc(whatsappClicks.clickedAt))
        .limit(limit)
        .offset(offset);
    }

    return await query;
  } catch (error) {
    console.error('[WhatsApp] Error fetching click history:', error);
    return [];
  }
}
