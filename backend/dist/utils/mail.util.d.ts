import { EmailService } from '../common/services/email.service';
export declare function sendOtpEmail(email: string, otp: string, emailService?: EmailService, userName?: string): Promise<void>;
