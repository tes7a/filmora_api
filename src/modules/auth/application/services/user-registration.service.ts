import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { user_status } from '@prisma/client';

import type { AuthRepository, PasswordHasher } from '../../infrastructure';
import { AUTH_REPOSITORY, PASSWORD_HASHER } from '../../infrastructure';
import { EmailConfirmationService } from './email-confirmation.service';

export interface RegisterUserDto {
  email: string;
  password: string;
  displayName: string;
}

@Injectable()
export class UserRegistrationService {
  private readonly UNCONFIRMED_USER_STATUS: user_status = 'pending';
  private readonly DEFAULT_USER_ROLE = 'user';

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    private readonly emailConfirmationService: EmailConfirmationService,
  ) {}

  async register(
    dto: RegisterUserDto,
  ): Promise<{ userId: string; message: string }> {
    const existingUser = await this.authRepository.findUserByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);

    const user = await this.authRepository.createUser({
      email: dto.email,
      passwordHash,
      displayName: dto.displayName,
      status: this.UNCONFIRMED_USER_STATUS,
    });

    await this.authRepository.createDefaultUserLists(user.id);

    await this.authRepository.assignUserRole(user.id, this.DEFAULT_USER_ROLE);

    await this.emailConfirmationService.sendConfirmationEmail(
      user.id,
      dto.email,
    );

    return {
      userId: user.id,
      message:
        'Registration successful. Please check your email to confirm your account.',
    };
  }
}
