import { Module } from '@nestjs/common';

import {
  GetFilmByIdService,
  GetFilmFullByIdService,
  GetFilmsService,
  GetMyFilmRatingService,
  GetSimilarFilmsService,
  UpdateFilmRatingService,
} from './application';
import { FILMS_REPOSITORY, PrismaFilmsRepository } from './infrastructure';
import { FilmsController } from './presentation';

@Module({
  controllers: [FilmsController],
  providers: [
    GetFilmByIdService,
    GetFilmFullByIdService,
    GetFilmsService,
    GetMyFilmRatingService,
    GetSimilarFilmsService,
    UpdateFilmRatingService,
    {
      provide: FILMS_REPOSITORY,
      useClass: PrismaFilmsRepository,
    },
  ],
  exports: [],
})
export class FilmsModule {}
