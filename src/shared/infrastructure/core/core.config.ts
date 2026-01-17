import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';

import { ConfigValidationUtility } from '@/utils';

import { CoreConfigSchema } from './core-config.schema';

interface EnvType {
  PORT: number;
  DATABASE_URL: string;
  // EMAIL_PASSWORD: string;
  // EMAIL_SERVICE: string;
  NODE_ENV: string;
  CORS_ORIGIN: string;
}

@Injectable()
export class CoreConfig {
  public readonly port: number;
  public readonly databaseUrl: string;
  public readonly emailPassword: string;
  public readonly emailService: string;
  public readonly nodeEnv: 'development' | 'test' | 'production';
  public readonly corsOrigin: string;

  constructor(
    private configService: ConfigService<EnvType, true>,
    private configValidationUtility: ConfigValidationUtility,
  ) {
    const raw = {
      port: Number(this.configService.get('PORT')),
      databaseUrl: this.configService.get('DATABASE_URL'),
      // emailPassword: this.configService.get('EMAIL_PASSWORD'),
      // emailService: this.configService.get('EMAIL_SERVICE'),
      nodeEnv: this.configService.get('NODE_ENV'),
      corsOrigin: this.configService.get('CORS_ORIGIN'),
    } satisfies Partial<CoreConfigSchema>;

    const schema = plainToInstance(CoreConfigSchema, raw);

    this.configValidationUtility.validateConfig(schema);

    this.port = schema.port;
    this.databaseUrl = schema.databaseUrl;
    // this.emailPassword = schema.emailPassword;
    // this.emailService = schema.emailService;
    this.nodeEnv = schema.nodeEnv as 'development' | 'test' | 'production';
    this.corsOrigin = schema.corsOrigin;
  }
}
