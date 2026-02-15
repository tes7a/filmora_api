import type {
  CreatedFilmReviewDto,
  CreateFilmReviewParams,
  FilmReviewDto,
  GetFilmReviewsParams,
  UpdatedReviewDto,
  UpdateReviewParams,
} from '../dto';

export type {
  CreatedFilmReviewDto,
  CreateFilmReviewParams,
  FilmReviewDto,
  GetFilmReviewsParams,
  UpdatedReviewDto,
  UpdateReviewParams,
} from '../dto';

export const REVIEWS_REPOSITORY = Symbol('REVIEWS_REPOSITORY');

export interface ReviewsRepository {
  getFilmReviews(params: GetFilmReviewsParams): Promise<FilmReviewDto[] | null>;
  createFilmReview(params: CreateFilmReviewParams): Promise<CreatedFilmReviewDto | null>;
  updateReview(params: UpdateReviewParams): Promise<UpdatedReviewDto | null>;
}
