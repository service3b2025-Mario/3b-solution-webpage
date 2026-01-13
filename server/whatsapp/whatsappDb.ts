/**
 * WhatsApp Database Operations
 * 
 * Database functions for WhatsApp team account management
 */

import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { getDb } from "../db";

// Note: These tables need to be added to the main schema
// For now, we'll use raw SQL queries until schema is migrated

export interface WhatsAppAccount {
  id: number;
  name: string;
  role: string;
  title?: string;
  phoneNumber: string;
  countryCode: string;
  displayOrder: number;
  isActive: boolean;
  isVisible: boolean;
  avatarUrl?: string;
  teamMemberId?: number;
  defaultMessage: string;
  visibleOnPages: string;
  totalClicks: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppClick {
  id: number;
  accountId: number;
  pagePath?: string;
  pageTitle?: string;
  propertyId?: number;
  visitorId?: string;
  userAgent?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  clickedAt: Date;
}

// Get active WhatsApp accounts for public display
export async function getActiveAccounts(page?: string): Promise<WhatsAppAccount[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    // Query active and visible accounts
    const result = await db.execute(sql`
      SELECT * FROM whatsapp_accounts 
      WHERE is_active = true AND is_visible = true
      ORDER BY display_order ASC, name ASC
    `);

    let accounts = (result.rows || []) as WhatsAppAccount[];

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
    const result = await db.execute(sql`
      SELECT * FROM whatsapp_accounts 
      ORDER BY display_order ASC, name ASC
    `);
    return (result.rows || []) as WhatsAppAccount[];
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
    const result = await db.execute(sql`
      SELECT * FROM whatsapp_accounts WHERE id = ${id}
    `);
    return (result.rows?.[0] as WhatsAppAccount) || null;
  } catch (error) {
    console.error('[WhatsApp] Error fetching account:', error);
    return null;
  }
}

// Create new WhatsApp account
export async function createAccount(data: Partial<WhatsAppAccount>): Promise<WhatsAppAccount | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.execute(sql`
      INSERT INTO whatsapp_accounts (
        name, role, title, phone_number, country_code,
        display_order, is_active, is_visible, avatar_url,
        team_member_id, default_message, visible_on_pages
      ) VALUES (
        ${data.name},
        ${data.role},
        ${data.title || null},
        ${data.phoneNumber},
        ${data.countryCode || '+49'},
        ${data.displayOrder || 0},
        ${data.isActive !== false},
        ${data.isVisible !== false},
        ${data.avatarUrl || null},
        ${data.teamMemberId || null},
        ${data.defaultMessage || "Hi! I'm interested in learning more about 3B Solution's real estate investment opportunities."},
        ${data.visibleOnPages || '["contact", "team", "about", "property"]'}
      )
      RETURNING *
    `);
    return (result.rows?.[0] as WhatsAppAccount) || null;
  } catch (error) {
    console.error('[WhatsApp] Error creating account:', error);
    throw error;
  }
}

// Update WhatsApp account
export async function updateAccount(id: number, data: Partial<WhatsAppAccount>): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) updates.push(`name = '${data.name}'`);
    if (data.role !== undefined) updates.push(`role = '${data.role}'`);
    if (data.title !== undefined) updates.push(`title = '${data.title}'`);
    if (data.phoneNumber !== undefined) updates.push(`phone_number = '${data.phoneNumber}'`);
    if (data.countryCode !== undefined) updates.push(`country_code = '${data.countryCode}'`);
    if (data.displayOrder !== undefined) updates.push(`display_order = ${data.displayOrder}`);
    if (data.isActive !== undefined) updates.push(`is_active = ${data.isActive}`);
    if (data.isVisible !== undefined) updates.push(`is_visible = ${data.isVisible}`);
    if (data.avatarUrl !== undefined) updates.push(`avatar_url = '${data.avatarUrl}'`);
    if (data.teamMemberId !== undefined) updates.push(`team_member_id = ${data.teamMemberId}`);
    if (data.defaultMessage !== undefined) updates.push(`default_message = '${data.defaultMessage}'`);
    if (data.visibleOnPages !== undefined) updates.push(`visible_on_pages = '${data.visibleOnPages}'`);

    updates.push(`updated_at = NOW()`);

    await db.execute(sql.raw(`
      UPDATE whatsapp_accounts 
      SET ${updates.join(', ')}
      WHERE id = ${id}
    `));

    return true;
  } catch (error) {
    console.error('[WhatsApp] Error updating account:', error);
    return false;
  }
}

// Delete WhatsApp account
export async function deleteAccount(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(sql`DELETE FROM whatsapp_accounts WHERE id = ${id}`);
    return true;
  } catch (error) {
    console.error('[WhatsApp] Error deleting account:', error);
    return false;
  }
}

// Track WhatsApp click
export async function trackClick(data: {
  accountId: number;
  pagePath?: string;
  pageTitle?: string;
  propertyId?: number;
  visitorId?: string;
  userAgent?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Insert click record
    await db.execute(sql`
      INSERT INTO whatsapp_clicks (
        account_id, page_path, page_title, property_id,
        visitor_id, user_agent, referrer,
        utm_source, utm_medium, utm_campaign
      ) VALUES (
        ${data.accountId},
        ${data.pagePath || null},
        ${data.pageTitle || null},
        ${data.propertyId || null},
        ${data.visitorId || null},
        ${data.userAgent || null},
        ${data.referrer || null},
        ${data.utmSource || null},
        ${data.utmMedium || null},
        ${data.utmCampaign || null}
      )
    `);

    // Update total clicks on account
    await db.execute(sql`
      UPDATE whatsapp_accounts 
      SET total_clicks = total_clicks + 1
      WHERE id = ${data.accountId}
    `);

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
    const byAccount = await db.execute(sql`
      SELECT 
        wa.id,
        wa.name,
        wa.role,
        wa.total_clicks,
        COUNT(wc.id) as recent_clicks
      FROM whatsapp_accounts wa
      LEFT JOIN whatsapp_clicks wc ON wa.id = wc.account_id
        AND wc.clicked_at >= NOW() - INTERVAL '30 days'
      GROUP BY wa.id, wa.name, wa.role, wa.total_clicks
      ORDER BY wa.total_clicks DESC
    `);

    // Clicks by page
    const byPage = await db.execute(sql`
      SELECT 
        page_path,
        COUNT(*) as clicks
      FROM whatsapp_clicks
      WHERE clicked_at >= NOW() - INTERVAL '30 days'
      GROUP BY page_path
      ORDER BY clicks DESC
      LIMIT 10
    `);

    // Clicks over time (last 30 days)
    const overTime = await db.execute(sql`
      SELECT 
        DATE(clicked_at) as date,
        COUNT(*) as clicks
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
      byAccount: byAccount.rows || [],
      byPage: byPage.rows || [],
      overTime: overTime.rows || [],
      totals: totals.rows?.[0] || { total_clicks: 0, unique_visitors: 0 },
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

    let query = sql`
      SELECT wc.*, wa.name as account_name
      FROM whatsapp_clicks wc
      LEFT JOIN whatsapp_accounts wa ON wc.account_id = wa.id
    `;

    if (filters?.accountId) {
      query = sql`
        SELECT wc.*, wa.name as account_name
        FROM whatsapp_clicks wc
        LEFT JOIN whatsapp_accounts wa ON wc.account_id = wa.id
        WHERE wc.account_id = ${filters.accountId}
        ORDER BY wc.clicked_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      query = sql`
        SELECT wc.*, wa.name as account_name
        FROM whatsapp_clicks wc
        LEFT JOIN whatsapp_accounts wa ON wc.account_id = wa.id
        ORDER BY wc.clicked_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const result = await db.execute(query);
    return (result.rows || []) as WhatsAppClick[];
  } catch (error) {
    console.error('[WhatsApp] Error fetching click history:', error);
    return [];
  }
}
