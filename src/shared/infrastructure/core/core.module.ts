import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ConfigValidationUtility } from '@/utils';

import { CoreConfig } from './core.config';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [CoreConfig, ConfigValidationUtility],
  exports: [CoreConfig],
})
export class CoreModule {}
