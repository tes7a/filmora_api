export type FilmsSortBy = 'rating' | 'date' | 'popularity';
export type SortOrder = 'asc' | 'desc';

export interface GetFilmsParams {
  q?: string;
  genreIds?: string[];
  tagIds?: string[];
  countryIds?: string[];
  yearFrom?: number;
  yearTo?: number;
  ratingFrom?: number;
  ratingTo?: number;
  sortBy: FilmsSortBy;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
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

export interface FilmCountryDto {
  id: string;
  code: string;
  name: string;
}

export interface FilmTagDto {
  id: string;
  name: string;
  slug: string;
}

export interface FilmPersonDto {
  personId: string;
  fullName: string;
  slug: string;
  roleType: string;
  characterName: string | null;
  billingOrder: number | null;
}

export interface FilmDetailsDto {
  id: string;
  title: string;
  originalTitle: string;
  description: string | null;
  releaseYear: number;
  durationMin: number;
  ageRating: string | null;
  averageRating: number;
  ratingsCount: number;
  genres: FilmListItemDto['genres'];
  tags: FilmTagDto[];
  countries: FilmCountryDto[];
  persons: FilmPersonDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FilmFullDto extends FilmDetailsDto {
  similarFilms: FilmListItemDto[];
  samePersonFilms: FilmListItemDto[];
}

export interface PaginatedFilmsDto {
  items: FilmListItemDto[];
  total: number;
  page: number;
  pageSize: number;
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
