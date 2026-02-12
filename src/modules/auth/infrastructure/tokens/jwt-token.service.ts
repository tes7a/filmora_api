import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';

import { CoreConfig } from '@/shared';

import type { TokenPayload } from '../dto';

export type { TokenPayload } from '../dto';

@Injectable()
export class JwtTokenService {
  private readonly ACCESS_TOKEN_EXPIRES_IN: string;
  private readonly REFRESH_TOKEN_EXPIRES_IN: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly coreConfig: CoreConfig,
  ) {
    this.ACCESS_TOKEN_EXPIRES_IN =
      this.coreConfig.accessTokenExpiresIn || '15m';
    this.REFRESH_TOKEN_EXPIRES_IN = this.coreConfig.refreshTokenExpiresIn || 7; // 7 days default
  }

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN as ms.StringValue,
    });
  }

  generateRefreshToken(): string {
    return randomBytes(64).toString('hex');
  }

  async generateEmailConfirmationToken(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId, type: 'email_confirmation' },
      { expiresIn: '24h' },
    );
  }

  async verifyEmailConfirmationToken(
    token: string,
  ): Promise<{ sub: string } | null> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      if (payload.type !== 'email_confirmation') return null;
      return { sub: payload.sub };
    } catch {
      return null;
    }
  }

  getRefreshTokenExpiresAt(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRES_IN);
    return expiresAt;
  }
}
