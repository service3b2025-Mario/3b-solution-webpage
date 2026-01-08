import { getBookings, updateBooking } from "./db";
import { sendTourReminder } from "./tourNotifications";
import { getPropertyById } from "./db";

/**
 * Tour Reminder Scheduler
 * 
 * Automatically sends reminders 24 hours before scheduled tours
 * Runs periodically to check for upcoming tours
 */

/**
 * Check for tours that need reminders and send them
 */
export async function checkAndSendReminders(): Promise<void> {
  try {
    console.log('[TourReminders] Checking for tours needing reminders...');
    
    // Get current time and 24-hour window
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfterTomorrow = new Date(now.getTime() + 25 * 60 * 60 * 1000);
    
    // Fetch bookings scheduled within the next 24-25 hours
    const upcomingBookings = await getBookings({
      status: 'scheduled',
      fromDate: tomorrow,
      limit: 100
    });
    
    if (!upcomingBookings || upcomingBookings.length === 0) {
      console.log('[TourReminders] No upcoming tours found');
      return;
    }
    
    let remindersSent = 0;
    
    for (const booking of upcomingBookings) {
      // Skip if reminder already sent
      if (booking.reminderSent) {
        continue;
      }
      
      // Check if tour is within 24-hour window
      const scheduledTime = new Date(booking.scheduledAt);
      if (scheduledTime < tomorrow || scheduledTime > dayAfterTomorrow) {
        continue;
      }
      
      // Get property details
      if (!booking.propertyId) {
        console.log(`[TourReminders] Skipping booking #${booking.id} - no property ID`);
        continue;
      }
      
      const property = await getPropertyById(booking.propertyId);
      if (!property) {
        console.log(`[TourReminders] Skipping booking #${booking.id} - property not found`);
        continue;
      }
      
      // Send reminder
      const success = await sendTourReminder(booking, property.title);
      
      if (success) {
        // Mark reminder as sent
        await updateBooking(booking.id, { reminderSent: true });
        remindersSent++;
        console.log(`[TourReminders] Reminder sent for booking #${booking.id}`);
      } else {
        console.error(`[TourReminders] Failed to send reminder for booking #${booking.id}`);
      }
    }
    
    console.log(`[TourReminders] Sent ${remindersSent} reminders`);
  } catch (error) {
    console.error('[TourReminders] Error in reminder scheduler:', error);
  }
}

/**
 * Start the reminder scheduler
 * Checks every hour for tours needing reminders
 */
export function startReminderScheduler(): void {
  console.log('[TourReminders] Starting reminder scheduler...');
  
  // Run immediately on startup
  checkAndSendReminders();
  
  // Then run every hour
  const intervalMs = 60 * 60 * 1000; // 1 hour
  setInterval(() => {
    checkAndSendReminders();
  }, intervalMs);
  
  console.log('[TourReminders] Reminder scheduler started (checking every hour)');
}

/**
 * Send immediate reminder for a specific booking
 * Useful for manual triggers or testing
 */
export async function sendImmediateReminder(bookingId: number): Promise<boolean> {
  try {
    const bookings = await getBookings({ limit: 1000 });
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking) {
      console.error(`[TourReminders] Booking #${bookingId} not found`);
      return false;
    }
    
    if (!booking.propertyId) {
      console.error(`[TourReminders] Booking #${bookingId} has no property ID`);
      return false;
    }
    
    const property = await getPropertyById(booking.propertyId);
    if (!property) {
      console.error(`[TourReminders] Property not found for booking #${bookingId}`);
      return false;
    }
    
    const success = await sendTourReminder(booking, property.title);
    
    if (success) {
      await updateBooking(bookingId, { reminderSent: true });
    }
    
    return success;
  } catch (error) {
    console.error(`[TourReminders] Error sending immediate reminder for booking #${bookingId}:`, error);
    return false;
  }
}

/**
 * Production deployment notes:
 * 
 * For production, consider using external cron services:
 * 
 * 1. **Vercel Cron Jobs** (if deploying to Vercel):
 *    - Create API route: /api/cron/tour-reminders
 *    - Add to vercel.json:
 *      {
 *        "crons": [{
 *          "path": "/api/cron/tour-reminders",
 *          "schedule": "0 * * * *"
 *        }]
 *      }
 * 
 * 2. **GitHub Actions** (for any deployment):
 *    - Create .github/workflows/tour-reminders.yml
 *    - Schedule to run hourly and call your API endpoint
 * 
 * 3. **External Cron Services**:
 *    - cron-job.org
 *    - EasyCron
 *    - AWS EventBridge
 *    - Google Cloud Scheduler
 * 
 * 4. **Database-based Job Queue**:
 *    - Bull (Redis-based)
 *    - Agenda (MongoDB-based)
 *    - pg-boss (PostgreSQL-based)
 * 
 * Current implementation uses in-memory setInterval, which:
 * - Works for development and single-server deployments
 * - Will reset if server restarts
 * - Not suitable for serverless or multi-instance deployments
 */
