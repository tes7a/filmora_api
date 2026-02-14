import { Module } from '@nestjs/common';

import { GetFilmsService, UpdateFilmRatingService } from './application';
import { FILMS_REPOSITORY, PrismaFilmsRepository } from './infrastructure';
import { FilmsController } from './presentation';

@Module({
  controllers: [FilmsController],
  providers: [
    GetFilmsService,
    UpdateFilmRatingService,
    {
      provide: FILMS_REPOSITORY,
      useClass: PrismaFilmsRepository,
    },
  ],
  exports: [],
})
export class FilmsModule {}
