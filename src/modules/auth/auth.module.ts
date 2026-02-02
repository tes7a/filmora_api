import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { CoreConfig } from '@/shared';

import {
  AuthLocalService,
  EmailConfirmationService,
  UserRegistrationService,
} from './application';
import {
  AUTH_REPOSITORY,
  BcryptPasswordHasher,
  JwtTokenService,
  PASSWORD_HASHER,
  PrismaAuthRepository,
} from './infrastructure';
import {
  AuthController,
  JwtAuthGuard,
  JwtStrategy,
  LocalAuthGuard,
  LocalStrategy,
} from './presentation';

@Module({
  controllers: [AuthController],
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig) => ({
        secret: coreConfig.jwtSecret,
        signOptions: {
          expiresIn: coreConfig.accessTokenExpiresIn as ms.StringValue,
        },
      }),
    }),
  ],
  providers: [
    // Guards & Strategies
    JwtAuthGuard,
    LocalAuthGuard,
    JwtStrategy,
    LocalStrategy,

    // Infrastructure
    JwtTokenService,
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: AUTH_REPOSITORY,
      useClass: PrismaAuthRepository,
    },

    // Application Services
    AuthLocalService,
    EmailConfirmationService,
    UserRegistrationService,
  ],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
