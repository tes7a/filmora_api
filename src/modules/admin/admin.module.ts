import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import {
  AddUserRoleService,
  GetUsersService,
  UpdateUserStatusService,
} from './application';
import { ADMIN_REPOSITORY, PrismaAdminRepository } from './infrastructure';
import { AdminController } from './presentation';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [
    AddUserRoleService,
    GetUsersService,
    UpdateUserStatusService,
    {
      provide: ADMIN_REPOSITORY,
      useClass: PrismaAdminRepository,
    },
  ],
  exports: [],
})
export class AdminModule {}
