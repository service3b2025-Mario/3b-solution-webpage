/**
 * Email OTP Service for 3B Solution
 * 
 * Sends one-time passwords via email for two-factor authentication.
 * Works with any email provider (Outlook, Gmail, etc.)
 * 
 * Uses Nodemailer with SMTP - compatible with Outlook/Microsoft 365
 */

import crypto from "crypto";
import nodemailer from "nodemailer";

// ============================================
// CONFIGURATION
// ============================================
const OTP_CONFIG = {
  // OTP settings
  otpLength: 6,                    // 6-digit code
  otpExpiryMs: 10 * 60 * 1000,    // 10 minutes
  maxAttempts: 3,                  // Max wrong attempts before OTP expires
  
  // Email settings (configured via environment variables)
  smtpHost: process.env.SMTP_HOST || "smtp.office365.com",
  smtpPort: parseInt(process.env.SMTP_PORT || "587"),
  smtpSecure: process.env.SMTP_SECURE === "true", // false for port 587 (STARTTLS)
  smtpUser: process.env.SMTP_USER || "",          // Your Outlook email
  smtpPass: process.env.SMTP_PASS || "",          // Your Outlook password or app password
  fromEmail: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@3bsolution.com",
  fromName: process.env.SMTP_FROM_NAME || "3B Solution Security",
};

// ============================================
// OTP STORAGE (In-memory)
// ============================================
interface OTPEntry {
  code: string;
  email: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  verified: boolean;
}

const otpStore = new Map<string, OTPEntry>();

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of otpStore.entries()) {
    if (now > entry.expiresAt) {
      otpStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// ============================================
// EMAIL TRANSPORTER
// ============================================
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    if (!OTP_CONFIG.smtpUser || !OTP_CONFIG.smtpPass) {
      throw new Error("SMTP credentials not configured. Set SMTP_USER and SMTP_PASS environment variables.");
    }
    
    transporter = nodemailer.createTransport({
      host: OTP_CONFIG.smtpHost,
      port: OTP_CONFIG.smtpPort,
      secure: OTP_CONFIG.smtpSecure,
      auth: {
        user: OTP_CONFIG.smtpUser,
        pass: OTP_CONFIG.smtpPass,
      },
      // Required for Outlook/Office 365
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
    });
    
    console.log(`[Email OTP] Transporter configured for ${OTP_CONFIG.smtpHost}:${OTP_CONFIG.smtpPort}`);
  }
  
  return transporter;
}

// ============================================
// OTP FUNCTIONS
// ============================================

function generateOTPCode(): string {
  const digits = "0123456789";
  let code = "";
  const randomBytes = crypto.randomBytes(OTP_CONFIG.otpLength);
  for (let i = 0; i < OTP_CONFIG.otpLength; i++) {
    code += digits[randomBytes[i] % 10];
  }
  return code;
}

function generateSessionId(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function sendOTP(email: string): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    if (!email || !email.includes("@")) {
      return { success: false, error: "Invalid email address" };
    }
    
    const code = generateOTPCode();
    const sessionId = generateSessionId();
    const now = Date.now();
    
    const otpEntry: OTPEntry = {
      code,
      email: email.toLowerCase(),
      createdAt: now,
      expiresAt: now + OTP_CONFIG.otpExpiryMs,
      attempts: 0,
      verified: false,
    };
    otpStore.set(sessionId, otpEntry);
    
    const mailTransporter = getTransporter();
    
    const mailOptions = {
      from: `"${OTP_CONFIG.fromName}" <${OTP_CONFIG.fromEmail}>`,
      to: email,
      subject: "Your 3B Solution Login Code",
      text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this code, please ignore this email.\n\n- 3B Solution Security Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Login Verification</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef; border-top: none;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">Your verification code for 3B Solution Admin login is:</p>
            
            <div style="background: white; border: 2px solid #1a365d; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a365d;">${code}</span>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              This code expires in <strong>10 minutes</strong>.
            </p>
            
            <p style="font-size: 14px; color: #666;">
              If you didn't request this code, please ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              This is an automated message from 3B Solution Security.  

              Please do not reply to this email.
            </p>
          </div>
        </body>
        </html>
      `,
    };
    
    await mailTransporter.sendMail(mailOptions);
    
    console.log(`[Email OTP] Code sent to ${email.substring(0, 3)}***@${email.split("@")[1]}`);
    
    return { success: true, sessionId };
    
  } catch (error) {
    console.error("[Email OTP] Failed to send OTP:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to send verification code" 
    };
  }
}

export function verifyOTP(sessionId: string, code: string): { valid: boolean; error?: string; remainingAttempts?: number } {
  const entry = otpStore.get(sessionId);
  
  if (!entry) {
    return { valid: false, error: "Verification session expired or invalid. Please request a new code." };
  }
  
  if (entry.verified) {
    return { valid: false, error: "This code has already been used. Please request a new code." };
  }
  
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(sessionId);
    return { valid: false, error: "Verification code has expired. Please request a new code." };
  }
  
  if (entry.attempts >= OTP_CONFIG.maxAttempts) {
    otpStore.delete(sessionId);
    return { valid: false, error: "Too many incorrect attempts. Please request a new code." };
  }
  
  const codeBuffer = Buffer.from(code.padEnd(OTP_CONFIG.otpLength, "0"));
  const entryBuffer = Buffer.from(entry.code);
  
  if (!crypto.timingSafeEqual(codeBuffer, entryBuffer)) {
    entry.attempts++;
    const remaining = OTP_CONFIG.maxAttempts - entry.attempts;
    return { 
      valid: false, 
      error: `Incorrect code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
      remainingAttempts: remaining,
    };
  }
  
  entry.verified = true;
  otpStore.delete(sessionId);
  
  console.log(`[Email OTP] Code verified successfully for session ${sessionId.substring(0, 8)}...`);
  
  return { valid: true };
}

export function getOTPEmail(sessionId: string): string | null {
  const entry = otpStore.get(sessionId);
  return entry ? entry.email : null;
}

export function isOTPSessionValid(sessionId: string): boolean {
  const entry = otpStore.get(sessionId);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) return false;
  if (entry.verified) return false;
  if (entry.attempts >= OTP_CONFIG.maxAttempts) return false;
  return true;
}

export function getOTPRemainingTime(sessionId: string): number {
  const entry = otpStore.get(sessionId);
  if (!entry) return 0;
  const remaining = entry.expiresAt - Date.now();
  return Math.max(0, Math.floor(remaining / 1000));
}

export async function testEmailConfiguration(): Promise<{ success: boolean; error?: string }> {
  try {
    const mailTransporter = getTransporter();
    await mailTransporter.verify();
    console.log("[Email OTP] SMTP configuration verified successfully");
    return { success: true };
  } catch (error) {
    console.error("[Email OTP] SMTP configuration test failed:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "SMTP configuration test failed" 
    };
  }
}

export function getOTPConfig() {
  return {
    otpLength: OTP_CONFIG.otpLength,
    expiryMinutes: OTP_CONFIG.otpExpiryMs / 60000,
    maxAttempts: OTP_CONFIG.maxAttempts,
    smtpHost: OTP_CONFIG.smtpHost,
    smtpPort: OTP_CONFIG.smtpPort,
    smtpConfigured: !!(OTP_CONFIG.smtpUser && OTP_CONFIG.smtpPass),
  };
}
