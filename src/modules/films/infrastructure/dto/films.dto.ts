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
