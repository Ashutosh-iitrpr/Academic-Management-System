import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const mailHost = this.configService.get<string>('MAIL_HOST');
    const mailPort = this.configService.get<number>('MAIL_PORT');
    const mailUser = this.configService.get<string>('MAIL_USER');
    const mailPassword = this.configService.get<string>('MAIL_PASSWORD');

    this.transporter = nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      secure: mailPort === 465, // true for 465, false for other ports
      auth: {
        user: mailUser,
        pass: mailPassword,
      },
    });
  }

  async sendOtpEmail(email: string, otp: string, name?: string): Promise<void> {
    try {
      const mailFrom = this.configService.get<string>('MAIL_FROM') || this.configService.get<string>('MAIL_USER');
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">Academic Management System</h1>
            <p style="margin: 10px 0 0 0;">OTP Verification</p>
          </div>
          
          <div style="padding: 40px; background-color: #f9f9f9; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none;">
            <p style="color: #333; font-size: 16px;">Hello ${name ? name : 'User'},</p>
            
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
              Your One-Time Password (OTP) for login is:
            </p>
            
            <div style="background-color: #fff; border: 2px dashed #667eea; padding: 20px; margin: 30px 0; text-align: center; border-radius: 5px;">
              <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">Use this code to sign in:</p>
              <p style="font-size: 32px; font-weight: bold; color: #667eea; margin: 0; letter-spacing: 5px;">${otp}</p>
            </div>
            
            <p style="color: #d9534f; font-size: 13px; margin: 20px 0;">
              <strong>⏱️ This code will expire in 5 minutes.</strong>
            </p>
            
            <p style="color: #666; font-size: 13px; margin: 20px 0 0 0;">
              If you did not request this OTP, please ignore this email. Your account remains secure.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              © 2026 IIT Ropar Academic Management System. All rights reserved.
            </p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: mailFrom,
        to: email,
        subject: 'Your OTP for Academic Portal Login',
        html: htmlContent,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`OTP email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}:`, error.message);
      throw new Error(`Failed to send OTP email: ${error.message}`);
    }
  }

  async sendTestEmail(email: string): Promise<void> {
    try {
      const mailFrom = this.configService.get<string>('MAIL_FROM') || this.configService.get<string>('MAIL_USER');
      
      const mailOptions = {
        from: mailFrom,
        to: email,
        subject: 'Test Email - Academic Management System',
        html: '<p>This is a test email from the Academic Management System.</p>',
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Test email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send test email to ${email}:`, error.message);
      throw new Error(`Failed to send test email: ${error.message}`);
    }
  }
}
