import { Inject, Injectable, Logger } from '@nestjs/common';

import { CoreConfig } from '@/shared';

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
  ) {}

  async sendConfirmationEmail(userId: string, email: string): Promise<void> {
    const token =
      await this.jwtTokenService.generateEmailConfirmationToken(userId);

    // TODO: Заменить на URL клиента с query параметром после настройки фронтенда
    // Пример: `${clientUrl}/confirm-email?token=${token}`
    const confirmationUrl = this.buildConfirmationUrl(token);

    // TODO: Подключить реальный email сервис (nodemailer, sendgrid, etc.)
    // Пока просто логируем для разработки
    this.logger.log(`
      ========== EMAIL CONFIRMATION ==========
      To: ${email}
      Subject: Подтвердите ваш email

      Для подтверждения email перейдите по ссылке:
      ${confirmationUrl}

      Ссылка действительна 24 часа.
      =========================================
    `);
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
    // TODO: Изменить на CLIENT_URL когда будет готов фронтенд
    // return `${this.coreConfig.clientUrl}/confirm-email?token=${token}`;

    // Временно используем API URL для подтверждения
    const apiBaseUrl = `http://localhost:${this.coreConfig.port}`;
    return `${apiBaseUrl}/auth/confirm-email?token=${token}`;
  }
}
