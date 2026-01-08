import { notifyOwner } from "./_core/notification";
import type { Booking } from "../drizzle/schema";

/**
 * Generate iCalendar (.ics) format string for tour booking
 */
export function generateCalendarInvite(booking: Booking, propertyTitle: string): string {
  const startDate = new Date(booking.scheduledAt);
  const endDate = new Date(startDate.getTime() + (booking.duration || 30) * 60000);
  
  // Format dates for iCal (YYYYMMDDTHHMMSSZ)
  const formatICalDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//3B Solution//Virtual Property Tour//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:tour-${booking.id}@3bsolution.com`,
    `DTSTAMP:${formatICalDate(new Date())}`,
    `DTSTART:${formatICalDate(startDate)}`,
    `DTEND:${formatICalDate(endDate)}`,
    `SUMMARY:Virtual Property Tour - ${propertyTitle}`,
    `DESCRIPTION:Virtual tour for ${propertyTitle}\\n\\nMeeting Type: ${booking.type}${booking.meetingUrl ? `\\nMeeting Link: ${booking.meetingUrl}` : ''}\\n\\nNotes: ${booking.notes || 'N/A'}`,
    `LOCATION:${booking.meetingUrl || 'Online'}`,
    `STATUS:CONFIRMED`,
    `SEQUENCE:0`,
    `BEGIN:VALARM`,
    `TRIGGER:-PT15M`,
    `DESCRIPTION:Reminder: Virtual Property Tour in 15 minutes`,
    `ACTION:DISPLAY`,
    `END:VALARM`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}

/**
 * Send booking confirmation email to user
 */
export async function sendBookingConfirmation(
  booking: Booking,
  propertyTitle: string,
  propertySlug: string
): Promise<boolean> {
  try {
    const scheduledDate = new Date(booking.scheduledAt);
    const formattedDate = scheduledDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = scheduledDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const emailContent = `
**New Virtual Tour Booking**

A virtual property tour has been scheduled:

**Property:** ${propertyTitle}
**Guest:** ${booking.userName} (${booking.userEmail})
**Date:** ${formattedDate}
**Time:** ${formattedTime} (${booking.timezone || 'UTC'})
**Duration:** ${booking.duration || 30} minutes
**Platform:** ${booking.type}
${booking.meetingUrl ? `**Meeting Link:** ${booking.meetingUrl}` : ''}

**Notes:** ${booking.notes || 'None'}

**Property Link:** https://3bsolution.com/properties/${propertySlug}

**Booking ID:** #${booking.id}
**Status:** ${booking.status}

---
*This is an automated notification from the 3B Solution booking system.*
    `.trim();

    // Send notification to admin/owner
    const success = await notifyOwner({
      title: `New Tour Booking: ${propertyTitle}`,
      content: emailContent
    });

    console.log(`[TourNotifications] Booking confirmation sent for booking #${booking.id}:`, success);
    
    // In production, also send email to user
    // await sendEmail({
    //   to: booking.userEmail,
    //   subject: `Tour Confirmed: ${propertyTitle}`,
    //   body: userEmailContent,
    //   attachments: [{ filename: 'tour.ics', content: generateCalendarInvite(booking, propertyTitle) }]
    // });

    return success;
  } catch (error) {
    console.error('[TourNotifications] Failed to send booking confirmation:', error);
    return false;
  }
}

/**
 * Send tour reminder notification (24 hours before)
 */
export async function sendTourReminder(
  booking: Booking,
  propertyTitle: string
): Promise<boolean> {
  try {
    const scheduledDate = new Date(booking.scheduledAt);
    const formattedDate = scheduledDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = scheduledDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const reminderContent = `
**Tour Reminder**

Your virtual property tour is scheduled for tomorrow:

**Property:** ${propertyTitle}
**Date:** ${formattedDate}
**Time:** ${formattedTime}
**Platform:** ${booking.type}
${booking.meetingUrl ? `**Meeting Link:** ${booking.meetingUrl}` : ''}

**Guest:** ${booking.userName} (${booking.userEmail})

Please ensure you're ready to join the meeting at the scheduled time.

**Booking ID:** #${booking.id}
    `.trim();

    const success = await notifyOwner({
      title: `Tour Reminder: ${propertyTitle} - Tomorrow`,
      content: reminderContent
    });

    console.log(`[TourNotifications] Reminder sent for booking #${booking.id}:`, success);
    return success;
  } catch (error) {
    console.error('[TourNotifications] Failed to send tour reminder:', error);
    return false;
  }
}

/**
 * Send cancellation notification
 */
/**
 * Send rescheduling notification
 */
export async function sendReschedulingNotification(data: {
  userName: string;
  userEmail: string;
  propertyTitle: string;
  oldDateTime: Date;
  newDateTime: Date;
  meetingUrl: string;
}): Promise<boolean> {
  try {
    const oldDateStr = data.oldDateTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
    
    const newDateStr = data.newDateTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
    
    const content = `
**Tour Rescheduled**

${data.userName} (${data.userEmail}) has rescheduled their virtual property tour.

**Property:** ${data.propertyTitle}

**Original Time:** ${oldDateStr} UTC
**New Time:** ${newDateStr} UTC

**Meeting Link:** ${data.meetingUrl}

Please update your calendar accordingly.

---
*This is an automated notification from the 3B Solution booking system.*
    `.trim();
    
    const success = await notifyOwner({
      title: `Tour Rescheduled: ${data.propertyTitle}`,
      content
    });
    
    console.log(`[TourNotifications] Rescheduling notification sent for ${data.propertyTitle}:`, success);
    return success;
  } catch (error) {
    console.error('[TourNotifications] Failed to send rescheduling notification:', error);
    return false;
  }
}

export async function sendCancellationNotification(
  booking: Booking,
  propertyTitle: string
): Promise<boolean> {
  try {
    const scheduledDate = new Date(booking.scheduledAt);
    const formattedDate = scheduledDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = scheduledDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const cancellationContent = `
**Tour Cancelled**

A virtual property tour has been cancelled:

**Property:** ${propertyTitle}
**Guest:** ${booking.userName} (${booking.userEmail})
**Original Date:** ${formattedDate}
**Original Time:** ${formattedTime}
**Platform:** ${booking.type}

**Booking ID:** #${booking.id}
**Cancelled At:** ${new Date().toLocaleString()}

---
*This is an automated notification from the 3B Solution booking system.*
    `.trim();

    const success = await notifyOwner({
      title: `Tour Cancelled: ${propertyTitle}`,
      content: cancellationContent
    });

    console.log(`[TourNotifications] Cancellation notification sent for booking #${booking.id}:`, success);
    return success;
  } catch (error) {
    console.error('[TourNotifications] Failed to send cancellation notification:', error);
    return false;
  }
}
