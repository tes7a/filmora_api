export type FilmsSortBy = 'rating' | 'newest';
export type SortOrder = 'asc' | 'desc';

export interface GetFilmsParams {
  search?: string;
  genres?: string[];
  years?: number[];
  sortBy: FilmsSortBy;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}

export interface FilmListItemDto {
  id: string;
  title: string;
  originalTitle: string;
  releaseYear: number;
  durationMin: number;
  ageRating: string | null;
  averageRating: number;
  ratingsCount: number;
  createdAt: Date;
  genres: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export interface PaginatedFilmsDto {
  items: FilmListItemDto[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateFilmRatingParams {
  filmId: string;
  userId: string;
  score: number;
}

export interface FilmRatingStatsDto {
  filmId: string;
  userScore: number;
  averageRating: number;
  ratingsCount: number;
}

export interface GetMyFilmRatingParams {
  filmId: string;
  userId: string;
}

export interface MyFilmRatingDto {
  filmId: string;
  userScore: number | null;
}

export interface CreateFilmReviewParams {
  filmId: string;
  userId: string;
  title: string;
  body: string;
}

export interface CreatedFilmReviewDto {
  reviewId: string;
  filmId: string;
  userId: string;
  currentVersionId: string;
  versionNumber: number;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilmReviewDto {
  reviewId: string;
  status: string;
  createdAt: Date;
  user: {
    id: string;
    displayName: string;
  };
  currentVersion: {
    id: string;
    versionNumber: number;
    title: string;
    body: string;
    createdAt: Date;
  } | null;
}

export interface GetFilmReviewsParams {
  filmId: string;
}

export interface UpdateReviewParams {
  filmId: string;
  userId: string;
  title: string;
  body: string;
}

export interface UpdatedReviewDto {
  reviewId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  currentVersion: {
    id: string;
    versionNumber: number;
    title: string;
    body: string;
    createdAt: Date;
  };
}

export interface CommentDto {
  commentId: string;
  reviewId: string;
  userId: string;
  parentId: string | null;
  body: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    displayName: string;
  };
}

export interface CommentTreeDto extends CommentDto {
  children: CommentTreeDto[];
}

export interface CreateReviewCommentParams {
  reviewId: string;
  userId: string;
  body: string;
  parentId?: string | null;
}

export interface GetReviewCommentsParams {
  reviewId: string;
}

export interface UpdateCommentParams {
  commentId: string;
  userId: string;
  body: string;
}

export interface DeleteCommentParams {
  commentId: string;
  userId: string;
}
