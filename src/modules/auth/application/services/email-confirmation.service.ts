import { Inject, Injectable, Logger } from '@nestjs/common';

import { CoreConfig, EmailService } from '@/shared';

import type { AuthRepository } from '../../infrastructure';
import { AUTH_REPOSITORY, JwtTokenService } from '../../infrastructure';

@Injectable()
export class EmailConfirmationService {
  private readonly logger = new Logger(EmailConfirmationService.name);

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    private readonly jwtTokenService: JwtTokenService,
    private readonly coreConfig: CoreConfig,
    private readonly emailService: EmailService,
  ) {}

  async sendConfirmationEmail(userId: string, email: string): Promise<void> {
    const token =
      await this.jwtTokenService.generateEmailConfirmationToken(userId);

    const confirmationUrl = this.buildConfirmationUrl(token);

    const sent = await this.emailService.sendConfirmationEmail(
      email,
      confirmationUrl,
    );

    if (sent) {
      this.logger.log(`Confirmation email sent to ${email}`);
    } else {
      this.logger.warn(`Failed to send confirmation email to ${email}`);
      this.logger.log(`Confirmation URL: ${confirmationUrl}`);
    }
  }

  async confirmEmail(
    token: string,
  ): Promise<{ success: boolean; message: string }> {
    const payload =
      await this.jwtTokenService.verifyEmailConfirmationToken(token);

    if (!payload) {
      return {
        success: false,
        message: 'Invalid or expired confirmation token',
      };
    }

    const user = await this.authRepository.findUserById(payload.sub);

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (user.status === 'active') {
      return { success: true, message: 'Email already confirmed' };
    }

    await this.authRepository.updateUserStatus(payload.sub, 'active');

    return { success: true, message: 'Email confirmed successfully' };
  }

  private buildConfirmationUrl(token: string): string {
    return `${this.coreConfig.clientUrl}/confirm-email?token=${token}`;
  }
}
