import { notifyOwner } from "./_core/notification";

export type ResourceDownloadEmailParams = {
  recipientEmail: string;
  recipientName: string;
  resourceTitle: string;
  resourceUrl: string;
  resourceCategory: string;
};

/**
 * Send resource download email to user
 * Since we don't have direct email service integration yet, we:
 * 1. Notify the owner about the download (so they can manually send the resource if needed)
 * 2. Log the email that should be sent
 * 
 * TODO: Replace with actual email service (SendGrid, AWS SES, etc.)
 */
export async function sendResourceDownloadEmail(
  params: ResourceDownloadEmailParams
): Promise<{ success: boolean; message: string }> {
  const { recipientEmail, recipientName, resourceTitle, resourceUrl, resourceCategory } = params;

  // Create email content
  const emailSubject = `Your ${getCategoryLabel(resourceCategory)}: ${resourceTitle}`;
  const emailBody = `
Dear ${recipientName},

Thank you for your interest in 3B Solution's investment resources!

You've requested to download: ${resourceTitle}

Download Link: ${resourceUrl}

This comprehensive ${getCategoryLabel(resourceCategory).toLowerCase()} contains valuable insights into luxury hospitality real estate investment opportunities. We hope you find it informative and useful for your investment decisions.

If you have any questions or would like to discuss investment opportunities, please don't hesitate to reach out to our team.

Best regards,
The 3B Solution Team

---
3B Solution - Premium Real Estate Investment
www.3bsolution.com
info@3bsolution.de
`.trim();

  // Log the email (for now, until we integrate a real email service)
  console.log('[EmailService] Resource Download Email:');
  console.log(`To: ${recipientEmail}`);
  console.log(`Subject: ${emailSubject}`);
  console.log(`Body:\n${emailBody}`);
  console.log('---');

  // Notify owner about the download
  try {
    await notifyOwner({
      title: `New Resource Download: ${resourceTitle}`,
      content: `${recipientName} (${recipientEmail}) downloaded "${resourceTitle}" (${resourceCategory}).\n\nDownload URL: ${resourceUrl}`,
    });
  } catch (error) {
    console.warn('[EmailService] Failed to notify owner:', error);
  }

  return {
    success: true,
    message: 'Email logged successfully. Manual follow-up may be required.',
  };
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    investment_guide: 'Investment Guide',
    market_report: 'Market Report',
    property_brochure: 'Property Brochure',
    case_study: 'Case Study',
    whitepaper: 'Whitepaper',
    newsletter: 'Newsletter',
  };
  return labels[category] || 'Resource';
}
