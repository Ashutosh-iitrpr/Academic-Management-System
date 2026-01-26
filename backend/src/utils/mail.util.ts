import { EmailService } from '../common/services/email.service';

export async function sendOtpEmail(email: string, otp: string, emailService?: EmailService, userName?: string) {
  // If email service is provided, use it to send real email
  if (emailService) {
    try {
      await emailService.sendOtpEmail(email, otp, userName);
    } catch (error) {
      console.error(`Error sending OTP email to ${email}:`, error.message);
      // Fallback: log to console if email sending fails
      console.log(`[FALLBACK] OTP for ${email}: ${otp}`);
    }
  } else {
    // Fallback: console log (for backward compatibility)
    console.log(`[CONSOLE LOG] OTP for ${email}: ${otp}`);
  }
}

