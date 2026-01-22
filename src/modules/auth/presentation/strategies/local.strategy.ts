import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthLocalService } from '../../application';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authLocalService: AuthLocalService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const payload = { username, password };

    const user = await this.authLocalService.validateUser(payload);

    if (!user) throw new UnauthorizedException();

    return user;
  }
}
