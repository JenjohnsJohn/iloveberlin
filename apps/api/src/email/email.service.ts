import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    this.logger.log('========================================');
    this.logger.log('VERIFICATION EMAIL (dev mode)');
    this.logger.log(`To: ${email}`);
    this.logger.log(`Subject: Verify your ILoveBerlin account`);
    this.logger.log(`Verification URL: ${verificationUrl}`);
    this.logger.log(`Token: ${token}`);
    this.logger.log('========================================');
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    this.logger.log('========================================');
    this.logger.log('PASSWORD RESET EMAIL (dev mode)');
    this.logger.log(`To: ${email}`);
    this.logger.log(`Subject: Reset your ILoveBerlin password`);
    this.logger.log(`Reset URL: ${resetUrl}`);
    this.logger.log(`Token: ${token}`);
    this.logger.log('========================================');
  }
}
