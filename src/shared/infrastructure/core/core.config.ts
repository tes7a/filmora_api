import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';

import { ConfigValidationUtility } from '@/utils';

import { CoreConfigSchema } from './core-config.schema';

interface EnvType {
  PORT: number;
  DATABASE_URL: string;
  NODE_ENV: string;
  CORS_ORIGIN: string;
  JWT_SECRET: string;
  ACCESS_TOKEN_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: number;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_SECURE: string;
  SMTP_USER: string;
  SMTP_PASSWORD: string;
  EMAIL_FROM_NAME: string;
  EMAIL_FROM_ADDRESS: string;
  CLIENT_URL: string;
}

@Injectable()
export class CoreConfig {
  public readonly port: number;
  public readonly databaseUrl: string;
  public readonly nodeEnv: 'development' | 'test' | 'production';
  public readonly corsOrigin: string;
  public readonly jwtSecret: string;
  public readonly refreshTokenCookieMaxAge: number;
  public readonly accessTokenExpiresIn: string;
  public readonly refreshTokenExpiresIn: number;

  // SMTP Configuration
  public readonly smtpHost: string;
  public readonly smtpPort: number;
  public readonly smtpSecure: boolean;
  public readonly smtpUser: string;
  public readonly smtpPassword: string;
  public readonly emailFromName: string;
  public readonly emailFromAddress: string;
  public readonly clientUrl: string;

  constructor(
    private configService: ConfigService<EnvType, true>,
    private configValidationUtility: ConfigValidationUtility,
  ) {
    const raw = {
      port: Number(this.configService.get('PORT')),
      databaseUrl: this.configService.get('DATABASE_URL'),
      nodeEnv: this.configService.get('NODE_ENV'),
      corsOrigin: this.configService.get('CORS_ORIGIN'),
      jwtSecret: this.configService.get('JWT_SECRET'),
      accessTokenExpiresIn: this.configService.get('ACCESS_TOKEN_EXPIRES_IN'),
      refreshTokenExpiresIn: Number(
        this.configService.get('REFRESH_TOKEN_EXPIRES_IN'),
      ),
      smtpHost: this.configService.get('SMTP_HOST') || 'smtp.gmail.com',
      smtpPort: Number(this.configService.get('SMTP_PORT')) || 587,
      smtpSecure: this.configService.get('SMTP_SECURE') === 'true',
      smtpUser: this.configService.get('SMTP_USER') || '',
      smtpPassword: this.configService.get('SMTP_PASSWORD') || '',
      emailFromName: this.configService.get('EMAIL_FROM_NAME') || 'Filmora',
      emailFromAddress:
        this.configService.get('EMAIL_FROM_ADDRESS') || 'noreply@filmora.com',
      clientUrl:
        this.configService.get('CLIENT_URL') || 'http://localhost:3000',
    } satisfies Partial<CoreConfigSchema>;

    const schema = plainToInstance(CoreConfigSchema, raw);

    this.configValidationUtility.validateConfig(schema);

    this.port = schema.port;
    this.databaseUrl = schema.databaseUrl;
    this.nodeEnv = schema.nodeEnv as 'development' | 'test' | 'production';
    this.corsOrigin = schema.corsOrigin;
    this.jwtSecret = schema.jwtSecret;
    this.accessTokenExpiresIn = schema.accessTokenExpiresIn;
    this.refreshTokenCookieMaxAge = schema.refreshTokenExpiresIn;

    // SMTP Configuration
    this.smtpHost = schema.smtpHost || 'smtp.gmail.com';
    this.smtpPort = schema.smtpPort || 587;
    this.smtpSecure = schema.smtpSecure || false;
    this.smtpUser = schema.smtpUser || '';
    this.smtpPassword = schema.smtpPassword || '';
    this.emailFromName = schema.emailFromName || 'Filmora';
    this.emailFromAddress = schema.emailFromAddress || 'noreply@filmora.com';
    this.clientUrl = schema.clientUrl || 'http://localhost:3000';
  }
}
