import type { GetFilmsParams, PaginatedFilmsDto } from '../dto';

export type { GetFilmsParams, PaginatedFilmsDto } from '../dto';

export const FILMS_REPOSITORY = Symbol('FILMS_REPOSITORY');

export interface FilmsRepository {
  getFilms(params: GetFilmsParams): Promise<PaginatedFilmsDto>;
}
