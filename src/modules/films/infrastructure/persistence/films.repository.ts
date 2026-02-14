import type {
  CommentDto,
  CommentTreeDto,
  CreatedFilmReviewDto,
  CreateFilmReviewParams,
  CreateReviewCommentParams,
  DeleteCommentParams,
  FilmRatingStatsDto,
  FilmReviewDto,
  GetFilmReviewsParams,
  GetFilmsParams,
  GetMyFilmRatingParams,
  GetReviewCommentsParams,
  MyFilmRatingDto,
  PaginatedFilmsDto,
  UpdateCommentParams,
  UpdatedReviewDto,
  UpdateFilmRatingParams,
  UpdateReviewParams,
} from '../dto';

export type {
  CommentDto,
  CommentTreeDto,
  CreatedFilmReviewDto,
  CreateFilmReviewParams,
  CreateReviewCommentParams,
  DeleteCommentParams,
  FilmRatingStatsDto,
  FilmReviewDto,
  GetFilmReviewsParams,
  GetFilmsParams,
  GetMyFilmRatingParams,
  GetReviewCommentsParams,
  MyFilmRatingDto,
  PaginatedFilmsDto,
  UpdateCommentParams,
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
  createReviewComment(params: CreateReviewCommentParams): Promise<CommentDto | null>;
  getReviewComments(params: GetReviewCommentsParams): Promise<CommentTreeDto[] | null>;
  updateComment(params: UpdateCommentParams): Promise<CommentDto | null>;
  deleteComment(params: DeleteCommentParams): Promise<CommentDto | null>;
}
