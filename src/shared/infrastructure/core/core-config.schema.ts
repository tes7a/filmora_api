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

  @IsString({ message: 'Set env variable JWT_SECRET' })
  jwtSecret!: string;

  @IsString({ message: 'Set env variable ACCESS_TOKEN_EXPIRES_IN' })
  accessTokenExpiresIn!: string;

  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'Set env variable REFRESH_TOKEN_EXPIRES_IN' },
  )
  refreshTokenExpiresIn!: number;
}
