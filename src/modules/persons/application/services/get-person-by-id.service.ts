import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  type PersonDetailsDto,
  PERSONS_REPOSITORY,
  type PersonsRepository,
} from '../../infrastructure';

@Injectable()
export class GetPersonByIdService {
  constructor(
    @Inject(PERSONS_REPOSITORY)
    private readonly personsRepository: PersonsRepository,
  ) {}

  async execute(personId: string): Promise<PersonDetailsDto> {
    const person = await this.personsRepository.getPersonById(personId);

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    return person;
  }
}
