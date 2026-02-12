import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(
    err: Error | null,
    user: TUser | false,
    info: Error | undefined,
    _context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      throw new UnauthorizedException(info?.message || 'Invalid or expired token');
    }

    return user;
  }
}
