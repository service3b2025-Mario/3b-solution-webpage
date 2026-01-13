/**
 * WhatsApp Database Operations
 * 
 * Database functions for WhatsApp team account management
 * Compatible with MySQL/TiDB
 */

import { sql } from "drizzle-orm";
import { getDb } from "../db";

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

// Helper to convert snake_case DB results to camelCase
function mapAccountFromDb(row: any): WhatsAppAccount {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    title: row.title,
    phoneNumber: row.phone_number,
    countryCode: row.country_code,
    displayOrder: row.display_order,
    isActive: Boolean(row.is_active),
    isVisible: Boolean(row.is_visible),
    avatarUrl: row.avatar_url,
    teamMemberId: row.team_member_id,
    defaultMessage: row.default_message || '',
    visibleOnPages: row.visible_on_pages || '[]',
    totalClicks: row.total_clicks || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Get active WhatsApp accounts for public display
export async function getActiveAccounts(page?: string): Promise<WhatsAppAccount[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.execute(sql`
      SELECT * FROM whatsapp_accounts 
      WHERE is_active = true AND is_visible = true
      ORDER BY display_order ASC, name ASC
    `);

    let accounts = (result.rows || result || []).map(mapAccountFromDb);

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
    return (result.rows || result || []).map(mapAccountFromDb);
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
    const rows = result.rows || result || [];
    const row = rows[0];
    return row ? mapAccountFromDb(row) : null;
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
    // Prepare values with proper defaults
    const name = data.name || '';
    const role = data.role || '';
    const title = data.title || null;
    const phoneNumber = data.phoneNumber || '';
    const countryCode = data.countryCode || '+49';
    const displayOrder = data.displayOrder || 0;
    const isActive = data.isActive !== false;
    const isVisible = data.isVisible !== false;
    const avatarUrl = data.avatarUrl || null;
    const teamMemberId = data.teamMemberId || null;
    const defaultMessage = data.defaultMessage || "Hi! I'm interested in learning more about 3B Solution's real estate investment opportunities.";
    const visibleOnPages = data.visibleOnPages || '["contact", "team", "about", "property"]';

    // MySQL INSERT
    await db.execute(sql`
      INSERT INTO whatsapp_accounts (
        name, role, title, phone_number, country_code,
        display_order, is_active, is_visible, avatar_url,
        team_member_id, default_message, visible_on_pages
      ) VALUES (
        ${name},
        ${role},
        ${title},
        ${phoneNumber},
        ${countryCode},
        ${displayOrder},
        ${isActive},
        ${isVisible},
        ${avatarUrl},
        ${teamMemberId},
        ${defaultMessage},
        ${visibleOnPages}
      )
    `);
    
    // Get the last inserted ID (MySQL way)
    const lastIdResult = await db.execute(sql`SELECT LAST_INSERT_ID() as id`);
    const lastIdRows = lastIdResult.rows || lastIdResult || [];
    const lastId = lastIdRows[0]?.id;
    
    if (lastId) {
      return getAccountById(lastId);
    }
    
    return null;
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
    // Build dynamic update - escape single quotes for MySQL
    const updates: string[] = [];
    
    if (data.name !== undefined) updates.push(`name = '${data.name.replace(/'/g, "''")}'`);
    if (data.role !== undefined) updates.push(`role = '${data.role.replace(/'/g, "''")}'`);
    if (data.title !== undefined) updates.push(`title = '${data.title.replace(/'/g, "''")}'`);
    if (data.phoneNumber !== undefined) updates.push(`phone_number = '${data.phoneNumber.replace(/'/g, "''")}'`);
    if (data.countryCode !== undefined) updates.push(`country_code = '${data.countryCode.replace(/'/g, "''")}'`);
    if (data.displayOrder !== undefined) updates.push(`display_order = ${data.displayOrder}`);
    if (data.isActive !== undefined) updates.push(`is_active = ${data.isActive}`);
    if (data.isVisible !== undefined) updates.push(`is_visible = ${data.isVisible}`);
    if (data.avatarUrl !== undefined) updates.push(`avatar_url = '${data.avatarUrl.replace(/'/g, "''")}'`);
    if (data.teamMemberId !== undefined) updates.push(`team_member_id = ${data.teamMemberId}`);
    if (data.defaultMessage !== undefined) updates.push(`default_message = '${data.defaultMessage.replace(/'/g, "''")}'`);
    if (data.visibleOnPages !== undefined) updates.push(`visible_on_pages = '${data.visibleOnPages.replace(/'/g, "''")}'`);

    if (updates.length === 0) return true; // Nothing to update

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
        AND wc.clicked_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY wa.id, wa.name, wa.role, wa.total_clicks
      ORDER BY wa.total_clicks DESC
    `);

    // Clicks by page
    const byPage = await db.execute(sql`
      SELECT 
        page_path,
        COUNT(*) as clicks
      FROM whatsapp_clicks
      WHERE clicked_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
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
      WHERE clicked_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(clicked_at)
      ORDER BY date ASC
    `);

    // Total stats
    const totals = await db.execute(sql`
      SELECT 
        COUNT(*) as total_clicks,
        COUNT(DISTINCT visitor_id) as unique_visitors
      FROM whatsapp_clicks
      WHERE clicked_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    const totalsRows = totals.rows || totals || [];

    return {
      byAccount: byAccount.rows || byAccount || [],
      byPage: byPage.rows || byPage || [],
      overTime: overTime.rows || overTime || [],
      totals: totalsRows[0] || { total_clicks: 0, unique_visitors: 0 },
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

    let result;
    if (filters?.accountId) {
      result = await db.execute(sql`
        SELECT wc.*, wa.name as account_name
        FROM whatsapp_clicks wc
        LEFT JOIN whatsapp_accounts wa ON wc.account_id = wa.id
        WHERE wc.account_id = ${filters.accountId}
        ORDER BY wc.clicked_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `);
    } else {
      result = await db.execute(sql`
        SELECT wc.*, wa.name as account_name
        FROM whatsapp_clicks wc
        LEFT JOIN whatsapp_accounts wa ON wc.account_id = wa.id
        ORDER BY wc.clicked_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `);
    }

    return (result.rows || result || []) as WhatsAppClick[];
  } catch (error) {
    console.error('[WhatsApp] Error fetching click history:', error);
    return [];
  }
}
