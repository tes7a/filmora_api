import type {
  CreatedFilmReviewDto,
  CreateFilmReviewParams,
  FilmRatingStatsDto,
  FilmReviewDto,
  GetFilmReviewsParams,
  GetFilmsParams,
  GetMyFilmRatingParams,
  MyFilmRatingDto,
  PaginatedFilmsDto,
  UpdatedReviewDto,
  UpdateFilmRatingParams,
  UpdateReviewParams,
} from '../dto';

export type {
  CreatedFilmReviewDto,
  CreateFilmReviewParams,
  FilmRatingStatsDto,
  FilmReviewDto,
  GetFilmReviewsParams,
  GetFilmsParams,
  GetMyFilmRatingParams,
  MyFilmRatingDto,
  PaginatedFilmsDto,
  UpdatedReviewDto,
  UpdateFilmRatingParams,
  UpdateReviewParams,
} from '../dto';

export const FILMS_REPOSITORY = Symbol('FILMS_REPOSITORY');

export interface FilmsRepository {
  getFilms(params: GetFilmsParams): Promise<PaginatedFilmsDto>;
  getFilmReviews(params: GetFilmReviewsParams): Promise<FilmReviewDto[] | null>;
  updateFilmRating(params: UpdateFilmRatingParams): Promise<FilmRatingStatsDto | null>;
  getMyFilmRating(params: GetMyFilmRatingParams): Promise<MyFilmRatingDto | null>;
  createFilmReview(params: CreateFilmReviewParams): Promise<CreatedFilmReviewDto | null>;
  updateReview(params: UpdateReviewParams): Promise<UpdatedReviewDto | null>;
}
