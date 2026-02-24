import type {
  FilmDetailsDto,
  FilmFullDto,
  FilmRatingStatsDto,
  GetFilmsParams,
  GetMyFilmRatingParams,
  MyFilmRatingDto,
  PaginatedFilmsDto,
  UpdateFilmRatingParams,
} from '../dto';

export type {
  FilmDetailsDto,
  FilmFullDto,
  FilmRatingStatsDto,
  GetFilmsParams,
  GetMyFilmRatingParams,
  MyFilmRatingDto,
  PaginatedFilmsDto,
  UpdateFilmRatingParams,
} from '../dto';

export const FILMS_REPOSITORY = Symbol('FILMS_REPOSITORY');

export interface FilmsRepository {
  getFilms(params: GetFilmsParams): Promise<PaginatedFilmsDto>;
  getFilmById(filmId: string): Promise<FilmDetailsDto | null>;
  getFilmFullById(filmId: string): Promise<FilmFullDto | null>;
  updateFilmRating(params: UpdateFilmRatingParams): Promise<FilmRatingStatsDto | null>;
  getMyFilmRating(params: GetMyFilmRatingParams): Promise<MyFilmRatingDto | null>;
}
