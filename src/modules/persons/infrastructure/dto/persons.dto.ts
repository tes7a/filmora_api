export type PersonsSortBy = 'fullName' | 'createdAt' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';

export interface GetPersonsParams {
  q?: string;
  page: number;
  pageSize: number;
  sortBy: PersonsSortBy;
  sortOrder: SortOrder;
}

export interface PersonListItemDto {
  id: string;
  fullName: string;
  slug: string;
  birthDate: Date | null;
  deathDate: Date | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonFilmRoleDto {
  filmId: string;
  title: string;
  originalTitle: string;
  releaseYear: number;
  roleType: string;
  characterName: string | null;
  billingOrder: number | null;
}

export interface PersonDetailsDto extends PersonListItemDto {
  films: PersonFilmRoleDto[];
}

export interface PaginatedPersonsDto {
  items: PersonListItemDto[];
  total: number;
  page: number;
  pageSize: number;
}
