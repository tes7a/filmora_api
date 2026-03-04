import { Module } from '@nestjs/common';

import { GetPersonByIdService, GetPersonsService } from './application';
import { PERSONS_REPOSITORY, PrismaPersonsRepository } from './infrastructure';
import { PersonsController } from './presentation';

@Module({
  controllers: [PersonsController],
  providers: [
    GetPersonsService,
    GetPersonByIdService,
    {
      provide: PERSONS_REPOSITORY,
      useClass: PrismaPersonsRepository,
    },
  ],
  exports: [],
})
export class PersonsModule {}
