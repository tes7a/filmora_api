import type {
  action_type,
  code_role,
  comment_status,
  complaint_status,
  film_status,
  genre_status,
  person_status,
  review_status,
  tag_status,
  target_type,
  target_type_ext,
  user_status,
} from '@prisma/client';

export interface AdminUserDto {
  id: string;
  email: string;
  displayName: string;
  status: user_status;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  roles: string[];
}

export type AdminUserSortBy =
  | 'createdAt'
  | 'updatedAt'
  | 'lastLoginAt'
  | 'email'
  | 'displayName'
  | 'status';

export type SortOrder = 'asc' | 'desc';

export interface GetUsersParams {
  excludeUserId: string;
  page: number;
  limit: number;
  sortBy: AdminUserSortBy;
  sortOrder: SortOrder;
  search?: string;
}

export interface PaginatedAdminUsersDto {
  items: AdminUserDto[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateUserStatusParams {
  userId: string;
  status: user_status;
}

export interface AddUserRoleParams {
  userId: string;
  roleCode: code_role;
}

export interface GetComplaintsParams {
  status?: complaint_status;
  page: number;
  limit: number;
}

export interface ModerateCommentOrReviewParams {
  targetId: string;
  moderatorId: string;
  reason: string;
  complaintId?: string;
}

export interface DeleteReviewOrCommentParams {
  targetId: string;
  moderatorId: string;
  reason: string;
  complaintId?: string;
}

export interface BlockUserParams {
  userId: string;
  moderatorId: string;
  reason: string;
  complaintId?: string;
}

export interface ComplaintDto {
  id: string;
  userId: string;
  targetType: target_type;
  targetId: string;
  reason: string;
  status: complaint_status;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
}

export interface ComplaintListItemDto extends ComplaintDto {
  user: {
    id: string;
    displayName: string;
  };
}

export interface PaginatedComplaintsDto {
  items: ComplaintListItemDto[];
  total: number;
  page: number;
  limit: number;
}

export interface ModerationActionDto {
  id: string;
  moderatorId: string;
  targetType: target_type_ext;
  targetId: string;
  actionType: action_type;
  reason: string | null;
  complaintId: string | null;
  createdAt: Date;
  reviewStatus?: review_status;
  commentStatus?: comment_status;
}

export interface GenreDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: genre_status;
  createdAt: Date;
  updatedAt: Date;
}

export type GenreSortBy = 'name' | 'status' | 'createdAt' | 'updatedAt';

export interface GetGenresParams {
  q?: string;
  status?: genre_status;
  page: number;
  limit: number;
  sortBy: GenreSortBy;
  sortOrder: SortOrder;
}

export interface PaginatedGenresDto {
  items: GenreDto[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateGenreParams {
  name: string;
  slug: string;
  description?: string;
  status: genre_status;
}

export interface UpdateGenreParams {
  id: string;
  name?: string;
  slug?: string;
  description?: string | null;
  status?: genre_status;
}

export interface MergeGenreParams {
  sourceGenreId: string;
  targetGenreId: string;
}

export interface TagDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: tag_status;
  createdAt: Date;
  updatedAt: Date;
}

export type TagSortBy = 'name' | 'status' | 'createdAt' | 'updatedAt';

export interface GetTagsParams {
  q?: string;
  status?: tag_status;
  page: number;
  limit: number;
  sortBy: TagSortBy;
  sortOrder: SortOrder;
}

export interface PaginatedTagsDto {
  items: TagDto[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateTagParams {
  name: string;
  slug: string;
  description?: string;
  status: tag_status;
}

export interface UpdateTagParams {
  id: string;
  name?: string;
  slug?: string;
  description?: string | null;
  status?: tag_status;
}

export interface CountryDto {
  id: string;
  code: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CountrySortBy = 'name' | 'code' | 'createdAt' | 'updatedAt';

export interface GetCountriesParams {
  q?: string;
  page: number;
  limit: number;
  sortBy: CountrySortBy;
  sortOrder: SortOrder;
}

export interface PaginatedCountriesDto {
  items: CountryDto[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateCountryParams {
  code: string;
  name: string;
}

export interface UpdateCountryParams {
  id: string;
  code?: string;
  name?: string;
}

export interface PersonDto {
  id: string;
  fullName: string;
  slug: string;
  birthDate: Date | null;
  deathDate: Date | null;
  bio: string | null;
  status: person_status;
  createdAt: Date;
  updatedAt: Date;
}

export type PersonSortBy = 'fullName' | 'status' | 'createdAt' | 'updatedAt';

export interface GetPersonsParams {
  q?: string;
  status?: person_status;
  page: number;
  limit: number;
  sortBy: PersonSortBy;
  sortOrder: SortOrder;
}

export interface PaginatedPersonsDto {
  items: PersonDto[];
  total: number;
  page: number;
  limit: number;
}

export interface CreatePersonParams {
  fullName: string;
  slug: string;
  birthDate?: Date | null;
  deathDate?: Date | null;
  bio?: string;
  status: person_status;
}

export interface UpdatePersonParams {
  id: string;
  fullName?: string;
  slug?: string;
  birthDate?: Date | null;
  deathDate?: Date | null;
  bio?: string | null;
  status?: person_status;
}

export interface AdminFilmDto {
  id: string;
  title: string;
  originalTitle: string;
  description: string | null;
  releaseYear: number;
  durationMin: number;
  ageRating: string | null;
  status: film_status;
  averageRating: number;
  ratingsCount: number;
  popularityScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export type AdminFilmSortBy =
  | 'title'
  | 'status'
  | 'releaseYear'
  | 'averageRating'
  | 'ratingsCount'
  | 'popularityScore'
  | 'createdAt'
  | 'updatedAt';

export interface GetAdminFilmsParams {
  q?: string;
  status?: film_status;
  yearFrom?: number;
  yearTo?: number;
  ratingFrom?: number;
  ratingTo?: number;
  page: number;
  limit: number;
  sortBy: AdminFilmSortBy;
  sortOrder: SortOrder;
}

export interface PaginatedAdminFilmsDto {
  items: AdminFilmDto[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateAdminFilmParams {
  title: string;
  originalTitle: string;
  description?: string;
  releaseYear: number;
  durationMin: number;
  ageRating?: string;
  status: film_status;
  popularityScore?: number;
}

export interface UpdateAdminFilmParams {
  id: string;
  title?: string;
  originalTitle?: string;
  description?: string | null;
  releaseYear?: number;
  durationMin?: number;
  ageRating?: string | null;
  status?: film_status;
  popularityScore?: number;
}
