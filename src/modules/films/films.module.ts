import { Module } from '@nestjs/common';

import {
  CreateFilmReviewService,
  GetFilmReviewsService,
  GetFilmsService,
  GetMyFilmRatingService,
  UpdateFilmRatingService,
  UpdateReviewService,
} from './application';
import { FILMS_REPOSITORY, PrismaFilmsRepository } from './infrastructure';
import { FilmsController } from './presentation';

@Module({
  controllers: [FilmsController],
  providers: [
    CreateFilmReviewService,
    GetFilmReviewsService,
    GetFilmsService,
    GetMyFilmRatingService,
    UpdateReviewService,
    UpdateFilmRatingService,
    {
      provide: FILMS_REPOSITORY,
      useClass: PrismaFilmsRepository,
    },
  ],
  exports: [],
})
export class FilmsModule {}
