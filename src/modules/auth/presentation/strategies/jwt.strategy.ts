import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { CoreConfig } from '@/shared';

import {
  AUTH_REPOSITORY,
  type AuthenticatedUser,
  type AuthRepository,
  type JwtPayload,
} from '../../infrastructure';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    coreConfig: CoreConfig,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: coreConfig.jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const isSessionActive = await this.authRepository.isSessionActive(
      payload.sessionId,
    );

    if (!isSessionActive) {
      throw new UnauthorizedException('Session has been revoked');
    }

    const user = await this.authRepository.findUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      status: user.status,
      roles: user.userRoles.map((userRole) => userRole.roles.code),
      displayName: user.displayName,
    };
  }
}
