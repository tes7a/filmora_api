import { IsNumber, IsString } from 'class-validator';

export class CoreConfigSchema {
  @IsNumber({}, { message: 'Set env variable PORT' })
  port!: number;

  @IsString({ message: 'Set env variable DATABASE_URL' })
  databaseUrl!: string;

  // @IsString()
  // emailPassword!: string;

  // @IsString()
  // emailService!: string;

  @IsString()
  nodeEnv!: string;

  @IsString({ message: 'Set env variable CORS_ORIGIN' })
  corsOrigin!: string;
}
