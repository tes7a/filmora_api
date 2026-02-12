import { Module } from '@nestjs/common';

import { GetFilmsService } from './application';
import { FILMS_REPOSITORY, PrismaFilmsRepository } from './infrastructure';
import { FilmsController } from './presentation';

@Module({
  controllers: [FilmsController],
  providers: [
    GetFilmsService,
    {
      provide: FILMS_REPOSITORY,
      useClass: PrismaFilmsRepository,
    },
  ],
  exports: [],
})
export class FilmsModule {}
