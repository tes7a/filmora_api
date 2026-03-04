export type RecommendationSortBy = 'rating' | 'date' | 'popularity';
export type SortOrder = 'asc' | 'desc';

export interface GetRecommendationsParams {
  q?: string;
  genreIds?: string[];
  tagIds?: string[];
  countryIds?: string[];
  yearFrom?: number;
  yearTo?: number;
  ratingFrom?: number;
  ratingTo?: number;
  sortBy?: RecommendationSortBy;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
}

export interface RecommendationItemDto {
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

export interface PaginatedRecommendationsDto {
  items: RecommendationItemDto[];
  total: number;
  page: number;
  pageSize: number;
}
