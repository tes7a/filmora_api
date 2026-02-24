import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import {
  AddFilmToListService,
  CreateCustomListService,
  GetMyListsService,
  RemoveFilmFromListService,
  UpdateListService,
} from './application';
import { LISTS_REPOSITORY, PrismaListsRepository } from './infrastructure';
import { ListsController } from './presentation';

@Module({
  imports: [AuthModule],
  controllers: [ListsController],
  providers: [
    AddFilmToListService,
    CreateCustomListService,
    GetMyListsService,
    RemoveFilmFromListService,
    UpdateListService,
    {
      provide: LISTS_REPOSITORY,
      useClass: PrismaListsRepository,
    },
  ],
  exports: [],
})
export class ListsModule {}
