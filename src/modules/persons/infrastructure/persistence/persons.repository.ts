import type {
  GetPersonsParams,
  PaginatedPersonsDto,
  PersonDetailsDto,
} from '../dto';

export type {
  GetPersonsParams,
  PaginatedPersonsDto,
  PersonDetailsDto,
} from '../dto';

export const PERSONS_REPOSITORY = Symbol('PERSONS_REPOSITORY');

export interface PersonsRepository {
  getPersons(params: GetPersonsParams): Promise<PaginatedPersonsDto>;
  getPersonById(personId: string): Promise<PersonDetailsDto | null>;
}
