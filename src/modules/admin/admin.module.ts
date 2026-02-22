import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import {
  AddUserRoleService,
  BlockUserService,
  DeleteCommentService,
  DeleteReviewService,
  GetComplaintsService,
  GetUsersService,
  HideCommentService,
  HideReviewService,
  UnhideCommentService,
  UnhideReviewService,
  UpdateUserStatusService,
} from './application';
import { ADMIN_REPOSITORY, PrismaAdminRepository } from './infrastructure';
import { AdminComplaintsController, AdminController } from './presentation';

@Module({
  imports: [AuthModule],
  controllers: [AdminController, AdminComplaintsController],
  providers: [
    AddUserRoleService,
    BlockUserService,
    DeleteCommentService,
    DeleteReviewService,
    GetComplaintsService,
    GetUsersService,
    HideCommentService,
    HideReviewService,
    UnhideCommentService,
    UnhideReviewService,
    UpdateUserStatusService,
    {
      provide: ADMIN_REPOSITORY,
      useClass: PrismaAdminRepository,
    },
  ],
  exports: [],
})
export class AdminModule {}
