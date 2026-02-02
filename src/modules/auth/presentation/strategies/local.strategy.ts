import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthLocalService } from '../../application';
import type { UserWithRoles } from '../../infrastructure';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authLocalService: AuthLocalService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<UserWithRoles> {
    const user = await this.authLocalService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }
}
