import { Inject, Injectable } from '@nestjs/common';

import {
  type GetPersonsParams,
  type PaginatedPersonsDto,
  PERSONS_REPOSITORY,
  type PersonsRepository,
} from '../../infrastructure';

@Injectable()
export class GetPersonsService {
  constructor(
    @Inject(PERSONS_REPOSITORY)
    private readonly personsRepository: PersonsRepository,
  ) {}

  async execute(params: GetPersonsParams): Promise<PaginatedPersonsDto> {
    return this.personsRepository.getPersons(params);
  }
}
