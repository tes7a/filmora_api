import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(
    err: Error | null,
    user: TUser | false,
    _info: Error | undefined,
    _context: ExecutionContext,
  ): TUser | undefined {
    if (err || !user) {
      return undefined;
    }

    return user;
  }
}
