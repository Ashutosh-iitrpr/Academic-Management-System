"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = sendOtpEmail;
async function sendOtpEmail(email, otp, emailService, userName) {
    if (emailService) {
        try {
            await emailService.sendOtpEmail(email, otp, userName);
        }
        catch (error) {
            console.error(`Error sending OTP email to ${email}:`, error.message);
            console.log(`[FALLBACK] OTP for ${email}: ${otp}`);
        }
    }
    else {
        console.log(`[CONSOLE LOG] OTP for ${email}: ${otp}`);
    }
}
//# sourceMappingURL=mail.util.js.map