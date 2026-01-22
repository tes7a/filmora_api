import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { CoreConfig } from '@/shared';

import {
  AuthController,
  JwtAuthGuard,
  JwtStrategy,
  LocalAuthGuard,
} from './presentation';

const expiresIn = '60s';

@Module({
  controllers: [AuthController],
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig) => ({
        secret: coreConfig.jwtSecret,
        signOptions: {
          expiresIn,
        },
      }),
    }),
  ],
  providers: [JwtAuthGuard, LocalAuthGuard, JwtStrategy],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
