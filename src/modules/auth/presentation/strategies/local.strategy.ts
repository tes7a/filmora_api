import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthLocalService } from '../../application';
import { UserWithRoles } from '../../infrastructure';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authLocalService: AuthLocalService) {
    super();
  }

  async validate(username: string, password: string): Promise<UserWithRoles> {
    const user = await this.authLocalService.validateUser(username, password);

    if (!user) throw new UnauthorizedException();

    return user;
  }
}
