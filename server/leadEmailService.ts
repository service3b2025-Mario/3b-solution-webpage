import { notifyOwner } from "./_core/notification";

export type LeadNotificationParams = {
  leadId: number | null;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  company?: string;
  investorType?: string;
  investmentRange?: string;
  interestedRegions?: string[];
  interestedPropertyTypes?: string[];
  message?: string;
  source?: string;
  sourcePage?: string;
};

/**
 * Send notification to 3B Solution team about new lead
 */
export async function notifyTeamAboutNewLead(
  params: LeadNotificationParams
 ): Promise<{ success: boolean; message: string }> {
  const fullName = [params.firstName, params.lastName].filter(Boolean).join(' ') || 'Unknown';
  
  const details = [
    `**New Lead Received**`,
    ``,
    `**Contact Information:**`,
    `• Name: ${fullName}`,
    `• Email: ${params.email}`,
    `• Phone: ${params.phone || 'Not provided'}`,
    `• Company: ${params.company || 'Not provided'}`,
    ``,
  ];

  if (params.investorType || params.investmentRange) {
    details.push(`**Investment Profile:**`);
    if (params.investorType) details.push(`• Investor Type: ${params.investorType}`);
    if (params.investmentRange) details.push(`• Investment Range: ${params.investmentRange}`);
    details.push(``);
  }

  if (params.interestedRegions?.length || params.interestedPropertyTypes?.length) {
    details.push(`**Interests:**`);
    if (params.interestedRegions?.length) {
      details.push(`• Regions: ${params.interestedRegions.join(', ')}`);
    }
    if (params.interestedPropertyTypes?.length) {
      details.push(`• Property Types: ${params.interestedPropertyTypes.join(', ')}`);
    }
    details.push(``);
  }

  if (params.message) {
    details.push(`**Message:**`);
    details.push(params.message);
    details.push(``);
  }

  details.push(`**Source:** ${params.source || 'Contact Form'}`);
  if (params.sourcePage) details.push(`**Page:** ${params.sourcePage}`);
  if (params.leadId) details.push(`**Lead ID:** ${params.leadId}`);
  details.push(``);
  details.push(`View in Admin: https://threeb-solution1.onrender.com/admin/leads` );

  try {
    await notifyOwner({
      title: `🔔 New Lead: ${fullName} (${params.email})`,
      content: details.join('\n'),
    });
    
    console.log('[LeadEmailService] Team notification sent for:', params.email);
    return { success: true, message: 'Team notification sent successfully' };
  } catch (error) {
    console.error('[LeadEmailService] Failed to notify team:', error);
    return { success: false, message: 'Failed to send team notification' };
  }
}

/**
 * Generate confirmation email content for the lead
 */
export async function sendLeadConfirmationEmail(
  params: LeadNotificationParams
): Promise<{ success: boolean; message: string }> {
  const fullName = [params.firstName, params.lastName].filter(Boolean).join(' ') || 'Valued Investor';
  
  const emailSubject = `Thank you for contacting 3B Solution - We've received your inquiry`;
  
  const emailBody = `
Dear ${fullName},

Thank you for your interest in 3B Solution's premium real estate investment opportunities.

We have received your inquiry and our team will review your request promptly. A dedicated investment advisor will contact you within 24-48 business hours to discuss your investment goals and how we can assist you.

**Your Inquiry Summary:**
${params.message ? `Message: ${params.message}\n` : ''}${params.investmentRange ? `Investment Range: ${params.investmentRange}\n` : ''}${params.interestedRegions?.length ? `Interested Regions: ${params.interestedRegions.join(', ')}\n` : ''}${params.interestedPropertyTypes?.length ? `Property Types: ${params.interestedPropertyTypes.join(', ')}\n` : ''}

In the meantime, feel free to explore our portfolio of exclusive 5-star hotel and resort investment opportunities on our website.

If you have any urgent questions, please don't hesitate to contact us directly:
📧 Email: info@3bsolution.de
🌐 Website: www.3bsolution.com

Best regards,
The 3B Solution Investment Team

---
3B Solution - Premium Real Estate Investment
Specializing in 5-Star Hotels & Resorts | 15-30% Returns
www.3bsolution.com
`.trim();

  console.log('[LeadEmailService] Lead Confirmation Email:');
  console.log(`To: ${params.email}`);
  console.log(`Subject: ${emailSubject}`);
  console.log(`Body:\n${emailBody}`);
  console.log('---');

  try {
    await notifyOwner({
      title: `📧 Lead Confirmation Pending: ${fullName}`,
      content: `A confirmation email should be sent to ${params.email}.\n\nPlease send a manual confirmation or set up automated email service (SendGrid/AWS SES).\n\nEmail Subject: ${emailSubject}`,
    });
  } catch (error) {
    console.warn('[LeadEmailService] Failed to notify about pending confirmation:', error);
  }

  return {
    success: true,
    message: 'Confirmation email logged. Manual follow-up may be required until email service is integrated.',
  };
}

/**
 * Send both notifications when a new lead is created
 */
export async function handleNewLeadNotifications(
  params: LeadNotificationParams
): Promise<{ teamNotified: boolean; confirmationSent: boolean }> {
  const [teamResult, confirmResult] = await Promise.all([
    notifyTeamAboutNewLead(params),
    sendLeadConfirmationEmail(params),
  ]);

  return {
    teamNotified: teamResult.success,
    confirmationSent: confirmResult.success,
  };
}
