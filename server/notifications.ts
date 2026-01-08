import { notifyOwner } from "./_core/notification";
import * as db from "./db";

/**
 * Email notification service for property match alerts
 */

export interface PropertyMatchNotification {
  userId: number;
  userEmail: string;
  userName: string;
  searchName: string;
  matchingProperties: Array<{
    id: number;
    title: string;
    city: string | null;
    country: string;
    priceMin: string | null;
    priceMax: string | null;
    expectedReturn?: string | null;
    mainImage?: string | null;
  }>;
}

/**
 * Send email notification to user when new properties match their saved search
 */
export async function sendPropertyMatchEmail(notification: PropertyMatchNotification): Promise<boolean> {
  const { userEmail, userName, searchName, matchingProperties } = notification;
  
  if (matchingProperties.length === 0) {
    return false;
  }

  // Build property list for email
  const propertyList = matchingProperties.map(prop => 
    `• ${prop.title} - ${prop.city || 'Location TBD'}, ${prop.country}\n  Price: $${parseInt(prop.priceMin || '0').toLocaleString()} - $${parseInt(prop.priceMax || '0').toLocaleString()}\n  ${prop.expectedReturn ? `Returns: ${prop.expectedReturn}` : ''}`
  ).join('\n\n');

  const emailContent = `
Dear ${userName || 'Valued Investor'},

Great news! We found ${matchingProperties.length} new ${matchingProperties.length === 1 ? 'property' : 'properties'} matching your saved search "${searchName}":

${propertyList}

View all matching properties: https://www.3bsolution.com/properties

To manage your saved searches or update notification preferences, visit:
https://www.3bsolution.com/my-saved-searches

---
Best regards,
3B Solution Team
Premium Real Estate Solutions

This email was sent because you have email notifications enabled for the saved search "${searchName}". 
To unsubscribe, visit your saved searches page and toggle off notifications.
  `.trim();

  try {
    // Send notification to owner (admin) about the match
    await notifyOwner({
      title: `Property Match Alert: ${userEmail}`,
      content: `User ${userName} (${userEmail}) has ${matchingProperties.length} new property matches for search "${searchName}"`
    });

    // TODO: In production, integrate with actual email service (SendGrid, AWS SES, etc.)
    // For now, we'll log and notify admin
    console.log(`[Email Notification] Would send to ${userEmail}:`, emailContent);
    
    return true;
  } catch (error) {
    console.error('[Email Notification] Failed to send:', error);
    return false;
  }
}

/**
 * Check all saved searches for new property matches and send notifications
 */
export async function checkSavedSearchesForMatches(): Promise<void> {
  try {
    // Get all saved searches with notifications enabled
    const allSearches = await db.getAllSavedSearchesWithNotifications();
    
    if (!allSearches || allSearches.length === 0) {
      console.log('[Notification Check] No saved searches with notifications enabled');
      return;
    }

    console.log(`[Notification Check] Checking ${allSearches.length} saved searches`);

    for (const search of allSearches) {
      try {
        // Get user info
        const user = await db.getUserById(search.userId);
        if (!user || !user.email) {
          console.log(`[Notification Check] Skipping search ${search.id}: user not found or no email`);
          continue;
        }

        // Parse filters
        const filters = typeof search.filters === 'string' 
          ? JSON.parse(search.filters) 
          : search.filters;

        // Get properties matching the search criteria
        const { items: matchingProperties } = await db.getProperties({
          region: filters.region && filters.region !== 'all' ? filters.region : undefined,
          country: filters.country && filters.country !== 'all' ? filters.country : undefined,
          propertyType: filters.propertyType && filters.propertyType !== 'all' ? filters.propertyType : undefined,
          minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
          maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
          status: 'available',
          limit: 10,
        });

        // Filter properties created since last notification
        const lastNotified = search.lastNotified ? new Date(search.lastNotified) : new Date(search.createdAt);
        const newProperties = matchingProperties.filter(prop => {
          const createdAt = new Date(prop.createdAt);
          return createdAt > lastNotified;
        });

        if (newProperties.length > 0) {
          console.log(`[Notification Check] Found ${newProperties.length} new matches for search "${search.name}"`);
          
          // Send notification
          const sent = await sendPropertyMatchEmail({
            userId: user.id,
            userEmail: user.email,
            userName: user.name || 'Valued Investor',
            searchName: search.name,
            matchingProperties: newProperties,
          });

          if (sent) {
            // Update last notified timestamp
            await db.updateSavedSearchLastNotified(search.id);
            console.log(`[Notification Check] Notification sent for search ${search.id}`);
          }
        } else {
          console.log(`[Notification Check] No new matches for search "${search.name}"`);
        }
      } catch (error) {
        console.error(`[Notification Check] Error processing search ${search.id}:`, error);
      }
    }

    console.log('[Notification Check] Completed');
  } catch (error) {
    console.error('[Notification Check] Fatal error:', error);
  }
}

/**
 * Schedule notification checks (to be called from a cron job or scheduler)
 * For now, this can be triggered manually or via admin action
 */
export function scheduleNotificationChecks() {
  // Run immediately on startup
  checkSavedSearchesForMatches();

  // Schedule to run every 6 hours
  setInterval(() => {
    checkSavedSearchesForMatches();
  }, 6 * 60 * 60 * 1000); // 6 hours in milliseconds

  console.log('[Notification Scheduler] Started - checking every 6 hours');
}
