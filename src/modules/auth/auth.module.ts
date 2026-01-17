import { Module } from '@nestjs/common';

import { AuthController } from './presentation';

@Module({
  controllers: [AuthController],
  providers: [],
  exports: [],
})
export class AuthModule {}
