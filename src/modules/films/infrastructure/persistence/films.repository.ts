import type {
  FilmRatingStatsDto,
  GetFilmsParams,
  PaginatedFilmsDto,
  UpdateFilmRatingParams,
} from '../dto';

export type {
  FilmRatingStatsDto,
  GetFilmsParams,
  PaginatedFilmsDto,
  UpdateFilmRatingParams,
} from '../dto';

export const FILMS_REPOSITORY = Symbol('FILMS_REPOSITORY');

export interface FilmsRepository {
  getFilms(params: GetFilmsParams): Promise<PaginatedFilmsDto>;
  updateFilmRating(params: UpdateFilmRatingParams): Promise<FilmRatingStatsDto | null>;
}
