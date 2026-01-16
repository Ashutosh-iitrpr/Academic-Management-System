export async function sendOtpEmail(email: string, otp: string) {
  // TEMP: console log (later we’ll use Nodemailer)
  console.log(`OTP for ${email}: ${otp}`);
}
