import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

/**
 * Email Configuration Tester
 * Use this service to test email configuration during development
 */
@Injectable()
export class EmailTestService {
  private logger = new Logger(EmailTestService.name);

  constructor(
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async testEmailConfiguration(): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log('Testing email configuration...');

      const mailHost = this.configService.get<string>('MAIL_HOST');
      const mailPort = this.configService.get<number>('MAIL_PORT');
      const mailUser = this.configService.get<string>('MAIL_USER');
      const mailPassword = this.configService.get<string>('MAIL_PASSWORD');

      // Check if all required variables are set
      if (!mailHost || !mailPort || !mailUser || !mailPassword) {
        const missing: string[] = [];
        if (!mailHost) missing.push('MAIL_HOST');
        if (!mailPort) missing.push('MAIL_PORT');
        if (!mailUser) missing.push('MAIL_USER');
        if (!mailPassword) missing.push('MAIL_PASSWORD');

        return {
          success: false,
          message: `Missing email configuration: ${missing.join(', ')}`,
        };
      }

      this.logger.log(`MAIL_HOST: ${mailHost}`);
      this.logger.log(`MAIL_PORT: ${mailPort}`);
      this.logger.log(`MAIL_USER: ${mailUser}`);

      // Try to send a test email to the configured email address
      await this.emailService.sendTestEmail(mailUser);

      return {
        success: true,
        message: `Email test sent successfully to ${mailUser}. Check your inbox.`,
      };
    } catch (error) {
      this.logger.error('Email configuration test failed:', error.message);
      return {
        success: false,
        message: `Email configuration test failed: ${error.message}`,
      };
    }
  }
}
