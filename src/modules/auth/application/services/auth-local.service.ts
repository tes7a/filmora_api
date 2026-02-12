import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';

import type {
  AuthRepository,
  PasswordHasher,
  UserWithRoles,
} from '../../infrastructure';
import {
  AUTH_REPOSITORY,
  JwtTokenService,
  PASSWORD_HASHER,
} from '../../infrastructure';
import type { LoginResult, RequestMeta } from '../dto';

export type { LoginResult, RequestMeta } from '../dto';

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
    user: UserWithRoles,
    res: Response,
    meta: RequestMeta,
  ): Promise<LoginResult> {
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
    const refreshToken = this.jwtTokenService.generateRefreshToken();

    const session = await this.createSession(user.id, refreshToken, meta);

    const accessToken = await this.jwtTokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      roles,
      sessionId: session.id,
    });

    this.setRefreshTokenCookie(res, refreshToken);

    return {
      accessToken,
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
    const oldSession =
      await this.authRepository.findSessionByRefreshToken(refreshToken);

    if (
      !oldSession ||
      oldSession.revokedAt ||
      oldSession.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.authRepository.findUserById(oldSession.userId);

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User not found or inactive');
    }

    await this.authRepository.revokeSession(oldSession.id);

    const roles = user.userRoles.map((ur) => ur.roles.code);
    const newRefreshToken = this.jwtTokenService.generateRefreshToken();

    const newSession = await this.createSession(user.id, newRefreshToken, meta);

    const accessToken = await this.jwtTokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      roles,
      sessionId: newSession.id,
    });

    this.setRefreshTokenCookie(res, newRefreshToken);

    return { accessToken };
  }

  async logout(refreshToken: string | undefined, res: Response): Promise<void> {
    if (refreshToken) {
      const session =
        await this.authRepository.findSessionByRefreshToken(refreshToken);

      if (session) {
        await this.authRepository.revokeSession(session.id);
        res.clearCookie(this.REFRESH_TOKEN_COOKIE_NAME);
      }
    }
  }

  private async createSession(
    userId: string,
    refreshToken: string,
    meta: RequestMeta,
  ): Promise<{ id: string }> {
    return this.authRepository.createSession({
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
