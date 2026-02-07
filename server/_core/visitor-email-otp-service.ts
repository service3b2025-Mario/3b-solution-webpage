/**
 * Visitor Email OTP Service for 3B Solution
 * 
 * Sends one-time passwords via email for passwordless visitor authentication.
 * Uses info@3bsolution.de as the sender (separate from admin OTP which uses mariobockph@3bsolution.de)
 * 
 * Uses Nodemailer with SMTP - compatible with Outlook/Microsoft 365
 */

import crypto from "crypto";
import nodemailer from "nodemailer";

// ============================================
// CONFIGURATION
// ============================================
const VISITOR_OTP_CONFIG = {
  // OTP settings
  otpLength: 6,                    // 6-digit code
  otpExpiryMs: 15 * 60 * 1000,    // 15 minutes (longer than admin OTP for better UX)
  maxAttempts: 5,                  // Max wrong attempts before OTP expires
  
  // Email settings - uses info@3bsolution.de for visitor emails
  smtpHost: process.env.SMTP_HOST || "smtp.office365.com",
  smtpPort: parseInt(process.env.SMTP_PORT || "587"),
  smtpSecure: process.env.SMTP_SECURE === "true",
  // Visitor OTP uses info@3bsolution.de credentials
  smtpUser: process.env.VISITOR_SMTP_USER || process.env.SMTP_USER || "",
  smtpPass: process.env.VISITOR_SMTP_PASS || process.env.SMTP_PASS || "",
  fromEmail: process.env.VISITOR_SMTP_FROM || "info@3bsolution.de",
  fromName: process.env.VISITOR_SMTP_FROM_NAME || "3B Solution",
};

// ============================================
// OTP STORAGE (In-memory)
// ============================================
interface VisitorOTPEntry {
  code: string;
  email: string;
  name?: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  verified: boolean;
}

const visitorOtpStore = new Map<string, VisitorOTPEntry>();

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of visitorOtpStore.entries()) {
    if (now > entry.expiresAt) {
      visitorOtpStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// ============================================
// EMAIL TRANSPORTER (separate from admin transporter)
// ============================================
let visitorTransporter: nodemailer.Transporter | null = null;

function getVisitorTransporter(): nodemailer.Transporter {
  if (!visitorTransporter) {
    if (!VISITOR_OTP_CONFIG.smtpUser || !VISITOR_OTP_CONFIG.smtpPass) {
      throw new Error("Visitor SMTP credentials not configured. Set VISITOR_SMTP_USER and VISITOR_SMTP_PASS environment variables.");
    }
    
    visitorTransporter = nodemailer.createTransport({
      host: VISITOR_OTP_CONFIG.smtpHost,
      port: VISITOR_OTP_CONFIG.smtpPort,
      secure: VISITOR_OTP_CONFIG.smtpSecure,
      auth: {
        user: VISITOR_OTP_CONFIG.smtpUser,
        pass: VISITOR_OTP_CONFIG.smtpPass,
      },
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
    });
    
    console.log(`[Visitor OTP] Transporter configured: ${VISITOR_OTP_CONFIG.smtpHost}:${VISITOR_OTP_CONFIG.smtpPort} from ${VISITOR_OTP_CONFIG.fromEmail}`);
  }
  
  return visitorTransporter;
}

// ============================================
// OTP FUNCTIONS
// ============================================

function generateOTPCode(): string {
  const digits = "0123456789";
  let code = "";
  const randomBytes = crypto.randomBytes(VISITOR_OTP_CONFIG.otpLength);
  for (let i = 0; i < VISITOR_OTP_CONFIG.otpLength; i++) {
    code += digits[randomBytes[i] % 10];
  }
  return code;
}

function generateSessionId(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Send OTP to visitor's email for passwordless login
 */
export async function sendVisitorOTP(
  email: string,
  name?: string
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    if (!email || !email.includes("@")) {
      return { success: false, error: "Invalid email address" };
    }
    
    const code = generateOTPCode();
    const sessionId = generateSessionId();
    const now = Date.now();
    
    // Store OTP
    const otpEntry: VisitorOTPEntry = {
      code,
      email: email.toLowerCase().trim(),
      name: name?.trim(),
      createdAt: now,
      expiresAt: now + VISITOR_OTP_CONFIG.otpExpiryMs,
      attempts: 0,
      verified: false,
    };
    visitorOtpStore.set(sessionId, otpEntry);
    
    // Send email
    const mailTransporter = getVisitorTransporter();
    
    const greeting = name ? `Hello ${name}` : "Hello";
    
    const mailOptions = {
      from: `"${VISITOR_OTP_CONFIG.fromName}" <${VISITOR_OTP_CONFIG.fromEmail}>`,
      to: email,
      subject: "Your 3B Solution Verification Code",
      text: `${greeting},\n\nYour verification code is: ${code}\n\nThis code expires in 15 minutes.\n\nUse this code to access your saved properties and personalized investment recommendations on 3B Solution.\n\nIf you didn't request this code, please ignore this email.\n\nBest regards,\n3B Solution Team\nwww.3bsolution.com`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #0f2b46 0%, #1a4a7a 50%, #c9a84c 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0 0 8px 0; font-size: 22px; font-weight: 600;">3B Solution</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 0; font-size: 14px;">Premium Real Estate Investment</p>
          </div>
          
          <div style="background: white; padding: 35px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <p style="font-size: 16px; margin-bottom: 10px;">${greeting},</p>
            
            <p style="font-size: 15px; margin-bottom: 24px; color: #555;">
              Here is your verification code to access your 3B Solution account:
            </p>
            
            <div style="background: #f8f9fa; border: 2px solid #c9a84c; border-radius: 10px; padding: 24px; text-align: center; margin: 24px 0;">
              <span style="font-size: 38px; font-weight: bold; letter-spacing: 10px; color: #0f2b46; font-family: 'Courier New', monospace;">${code}</span>
            </div>
            
            <p style="font-size: 13px; color: #888; margin-top: 20px; text-align: center;">
              This code expires in <strong>15 minutes</strong>
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 28px 0;">
            
            <p style="font-size: 14px; color: #666; margin-bottom: 8px;">
              With your account you can:
            </p>
            <ul style="font-size: 14px; color: #666; padding-left: 20px; margin: 0 0 20px 0;">
              <li style="margin-bottom: 6px;">Save properties to your wishlist</li>
              <li style="margin-bottom: 6px;">Create custom search alerts</li>
              <li style="margin-bottom: 6px;">Track your favorite investments</li>
              <li style="margin-bottom: 6px;">Get personalized recommendations</li>
            </ul>
            
            <p style="font-size: 12px; color: #999;">
              If you didn't request this code, you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            
            <p style="font-size: 12px; color: #aaa; text-align: center; margin: 0;">
              3B Solution &middot; Premium Real Estate Investment<br>
              <a href="https://www.3bsolution.com" style="color: #c9a84c; text-decoration: none;">www.3bsolution.com</a>
              &middot; <a href="mailto:info@3bsolution.de" style="color: #c9a84c; text-decoration: none;">info@3bsolution.de</a>
            </p>
          </div>
        </body>
        </html>
      `,
    };
    
    await mailTransporter.sendMail(mailOptions);
    
    console.log(`[Visitor OTP] Code sent to ${email.substring(0, 3)}***@${email.split("@")[1]}`);
    
    return { success: true, sessionId };
    
  } catch (error) {
    console.error("[Visitor OTP] Failed to send OTP:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to send verification code" 
    };
  }
}

/**
 * Verify visitor OTP code
 */
export function verifyVisitorOTP(sessionId: string, code: string): { 
  valid: boolean; 
  email?: string;
  name?: string;
  error?: string; 
  remainingAttempts?: number;
} {
  const entry = visitorOtpStore.get(sessionId);
  
  if (!entry) {
    return { valid: false, error: "Verification session expired or invalid. Please request a new code." };
  }
  
  if (entry.verified) {
    return { valid: false, error: "This code has already been used. Please request a new code." };
  }
  
  if (Date.now() > entry.expiresAt) {
    visitorOtpStore.delete(sessionId);
    return { valid: false, error: "Verification code has expired. Please request a new code." };
  }
  
  if (entry.attempts >= VISITOR_OTP_CONFIG.maxAttempts) {
    visitorOtpStore.delete(sessionId);
    return { valid: false, error: "Too many incorrect attempts. Please request a new code." };
  }
  
  // Constant-time comparison
  const codeBuffer = Buffer.from(code.padEnd(VISITOR_OTP_CONFIG.otpLength, "0"));
  const entryBuffer = Buffer.from(entry.code);
  
  if (!crypto.timingSafeEqual(codeBuffer, entryBuffer)) {
    entry.attempts++;
    const remaining = VISITOR_OTP_CONFIG.maxAttempts - entry.attempts;
    return { 
      valid: false, 
      error: `Incorrect code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
      remainingAttempts: remaining,
    };
  }
  
  // Mark as verified
  entry.verified = true;
  visitorOtpStore.delete(sessionId);
  
  console.log(`[Visitor OTP] Code verified for ${entry.email.substring(0, 3)}***`);
  
  return { valid: true, email: entry.email, name: entry.name };
}

/**
 * Get visitor OTP session email
 */
export function getVisitorOTPEmail(sessionId: string): string | null {
  const entry = visitorOtpStore.get(sessionId);
  return entry ? entry.email : null;
}

/**
 * Test visitor email configuration
 */
export async function testVisitorEmailConfiguration(): Promise<{ success: boolean; error?: string }> {
  try {
    const mailTransporter = getVisitorTransporter();
    await mailTransporter.verify();
    console.log("[Visitor OTP] SMTP configuration verified successfully");
    return { success: true };
  } catch (error) {
    console.error("[Visitor OTP] SMTP configuration test failed:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "SMTP configuration test failed" 
    };
  }
}
