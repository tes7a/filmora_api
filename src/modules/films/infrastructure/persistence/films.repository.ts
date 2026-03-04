import type {
  FilmDetailsDto,
  FilmFullDto,
  FilmRatingStatsDto,
  GetFilmsParams,
  GetMyFilmRatingParams,
  GetSimilarFilmsParams,
  MyFilmRatingDto,
  PaginatedFilmsDto,
  PaginatedSimilarFilmsDto,
  UpdateFilmRatingParams,
} from '../dto';

export type {
  FilmDetailsDto,
  FilmFullDto,
  FilmRatingStatsDto,
  GetFilmsParams,
  GetMyFilmRatingParams,
  GetSimilarFilmsParams,
  MyFilmRatingDto,
  PaginatedFilmsDto,
  PaginatedSimilarFilmsDto,
  SimilarFilmDto,
  UpdateFilmRatingParams,
} from '../dto';

export const FILMS_REPOSITORY = Symbol('FILMS_REPOSITORY');

export interface FilmsRepository {
  getFilms(params: GetFilmsParams): Promise<PaginatedFilmsDto>;
  getFilmById(filmId: string): Promise<FilmDetailsDto | null>;
  getFilmFullById(filmId: string): Promise<FilmFullDto | null>;
  getSimilarFilms(
    filmId: string,
    params: GetSimilarFilmsParams,
  ): Promise<PaginatedSimilarFilmsDto | null>;
  updateFilmRating(params: UpdateFilmRatingParams): Promise<FilmRatingStatsDto | null>;
  getMyFilmRating(params: GetMyFilmRatingParams): Promise<MyFilmRatingDto | null>;
}
