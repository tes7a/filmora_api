import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';

import type { AuthRepository, PasswordHasher } from '../../infrastructure';
import {
  AUTH_REPOSITORY,
  JwtTokenService,
  PASSWORD_HASHER,
} from '../../infrastructure';

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    roles: string[];
  };
}

export interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuthLocalService {
  private readonly REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
  private readonly REFRESH_TOKEN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.authRepository.findUserByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await this.passwordHasher.compare(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(
    dto: LoginDto,
    res: Response,
    meta: RequestMeta,
  ): Promise<LoginResult> {
    const user = await this.validateUser(dto.email, dto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === 'pending') {
      throw new UnauthorizedException(
        'Please confirm your email before logging in',
      );
    }

    if (user.status === 'blocked') {
      throw new UnauthorizedException('Account has been blocked');
    }

    if (user.status === 'deleted') {
      throw new UnauthorizedException('Account has been deleted');
    }

    const roles = user.userRoles.map((ur) => ur.roles.code);

    const tokenPair = await this.jwtTokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
      roles,
    });

    await this.createSession(user.id, tokenPair.refreshToken, meta);

    this.setRefreshTokenCookie(res, tokenPair.refreshToken);

    return {
      accessToken: tokenPair.accessToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        roles,
      },
    };
  }

  async refreshTokens(
    refreshToken: string,
    res: Response,
    meta: RequestMeta,
  ): Promise<{ accessToken: string }> {
    const session =
      await this.authRepository.findSessionByRefreshToken(refreshToken);

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.authRepository.findUserById(session.userId);

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User not found or inactive');
    }

    await this.authRepository.revokeSession(session.id);

    const roles = user.userRoles.map((ur) => ur.roles.code);

    const tokenPair = await this.jwtTokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
      roles,
    });

    await this.createSession(user.id, tokenPair.refreshToken, meta);

    this.setRefreshTokenCookie(res, tokenPair.refreshToken);

    return { accessToken: tokenPair.accessToken };
  }

  async logout(refreshToken: string, res: Response): Promise<void> {
    const session =
      await this.authRepository.findSessionByRefreshToken(refreshToken);

    if (session) {
      await this.authRepository.revokeSession(session.id);
    }

    res.clearCookie(this.REFRESH_TOKEN_COOKIE_NAME);
  }

  private async createSession(
    userId: string,
    refreshToken: string,
    meta: RequestMeta,
  ): Promise<void> {
    await this.authRepository.createSession({
      userId,
      refreshToken,
      expiresAt: this.jwtTokenService.getRefreshTokenExpiresAt(),
      ip: meta.ip,
      userAgent: meta.userAgent,
    });
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie(this.REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: this.REFRESH_TOKEN_COOKIE_MAX_AGE,
    });
  }
}
