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
  ManageCountriesService,
  ManageFilmsService,
  ManageGenresService,
  ManagePersonsService,
  ManageTagsService,
  UnhideCommentService,
  UnhideReviewService,
  UpdateUserStatusService,
} from './application';
import { ADMIN_REPOSITORY, PrismaAdminRepository } from './infrastructure';
import {
  AdminComplaintsController,
  AdminController,
  AdminCountriesController,
  AdminFilmsController,
  AdminGenresController,
  AdminPersonsController,
  AdminTagsController,
} from './presentation';

@Module({
  imports: [AuthModule],
  controllers: [
    AdminController,
    AdminComplaintsController,
    AdminGenresController,
    AdminTagsController,
    AdminCountriesController,
    AdminPersonsController,
    AdminFilmsController,
  ],
  providers: [
    AddUserRoleService,
    BlockUserService,
    DeleteCommentService,
    DeleteReviewService,
    GetComplaintsService,
    GetUsersService,
    HideCommentService,
    HideReviewService,
    ManageCountriesService,
    ManageFilmsService,
    ManageGenresService,
    ManagePersonsService,
    ManageTagsService,
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
