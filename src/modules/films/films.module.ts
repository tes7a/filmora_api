import { Module } from '@nestjs/common';

import {
  GetFilmsService,
  GetMyFilmRatingService,
  UpdateFilmRatingService,
} from './application';
import { FILMS_REPOSITORY, PrismaFilmsRepository } from './infrastructure';
import { FilmsController } from './presentation';

@Module({
  controllers: [FilmsController],
  providers: [
    GetFilmsService,
    GetMyFilmRatingService,
    UpdateFilmRatingService,
    {
      provide: FILMS_REPOSITORY,
      useClass: PrismaFilmsRepository,
    },
  ],
  exports: [],
})
export class FilmsModule {}
