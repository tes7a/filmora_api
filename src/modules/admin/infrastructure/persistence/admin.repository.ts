import type {
  AddUserRoleParams,
  AdminFilmDto,
  AdminUserDto,
  BlockUserParams,
  CountryDto,
  CreateAdminFilmParams,
  CreateCountryParams,
  CreateGenreParams,
  CreatePersonParams,
  CreateTagParams,
  DeleteReviewOrCommentParams,
  GenreDto,
  GetAdminFilmsParams,
  GetComplaintsParams,
  GetCountriesParams,
  GetGenresParams,
  GetPersonsParams,
  GetTagsParams,
  GetUsersParams,
  MergeGenreParams,
  ModerateCommentOrReviewParams,
  ModerationActionDto,
  PaginatedAdminFilmsDto,
  PaginatedAdminUsersDto,
  PaginatedComplaintsDto,
  PaginatedCountriesDto,
  PaginatedGenresDto,
  PaginatedPersonsDto,
  PaginatedTagsDto,
  PersonDto,
  TagDto,
  UpdateAdminFilmParams,
  UpdateCountryParams,
  UpdateGenreParams,
  UpdatePersonParams,
  UpdateTagParams,
  UpdateUserStatusParams,
} from '../dto';

export type {
  AddUserRoleParams,
  AdminFilmDto,
  AdminUserDto,
  BlockUserParams,
  CountryDto,
  CreateAdminFilmParams,
  CreateCountryParams,
  CreateGenreParams,
  CreatePersonParams,
  CreateTagParams,
  DeleteReviewOrCommentParams,
  GenreDto,
  GetAdminFilmsParams,
  GetComplaintsParams,
  GetCountriesParams,
  GetGenresParams,
  GetPersonsParams,
  GetTagsParams,
  GetUsersParams,
  MergeGenreParams,
  ModerateCommentOrReviewParams,
  ModerationActionDto,
  PaginatedAdminFilmsDto,
  PaginatedAdminUsersDto,
  PaginatedComplaintsDto,
  PaginatedCountriesDto,
  PaginatedGenresDto,
  PaginatedPersonsDto,
  PaginatedTagsDto,
  PersonDto,
  TagDto,
  UpdateAdminFilmParams,
  UpdateCountryParams,
  UpdateGenreParams,
  UpdatePersonParams,
  UpdateTagParams,
  UpdateUserStatusParams,
} from '../dto';

export const ADMIN_REPOSITORY = Symbol('ADMIN_REPOSITORY');

export interface AdminRepository {
  getUsers(params: GetUsersParams): Promise<PaginatedAdminUsersDto>;
  getComplaints(params: GetComplaintsParams): Promise<PaginatedComplaintsDto>;
  updateUserStatus(params: UpdateUserStatusParams): Promise<AdminUserDto | null>;
  addUserRole(params: AddUserRoleParams): Promise<AdminUserDto | null>;
  hideReview(params: ModerateCommentOrReviewParams): Promise<ModerationActionDto | null>;
  unhideReview(
    params: ModerateCommentOrReviewParams,
  ): Promise<ModerationActionDto | null>;
  deleteReview(
    params: DeleteReviewOrCommentParams,
  ): Promise<ModerationActionDto | null>;
  hideComment(params: ModerateCommentOrReviewParams): Promise<ModerationActionDto | null>;
  unhideComment(
    params: ModerateCommentOrReviewParams,
  ): Promise<ModerationActionDto | null>;
  deleteComment(
    params: DeleteReviewOrCommentParams,
  ): Promise<ModerationActionDto | null>;
  blockUser(params: BlockUserParams): Promise<ModerationActionDto | null>;
  getGenres(params: GetGenresParams): Promise<PaginatedGenresDto>;
  createGenre(params: CreateGenreParams): Promise<GenreDto>;
  updateGenre(params: UpdateGenreParams): Promise<GenreDto | null>;
  deleteGenre(id: string): Promise<boolean>;
  mergeGenre(params: MergeGenreParams): Promise<GenreDto | null>;
  getTags(params: GetTagsParams): Promise<PaginatedTagsDto>;
  createTag(params: CreateTagParams): Promise<TagDto>;
  updateTag(params: UpdateTagParams): Promise<TagDto | null>;
  deleteTag(id: string): Promise<boolean>;
  getCountries(params: GetCountriesParams): Promise<PaginatedCountriesDto>;
  createCountry(params: CreateCountryParams): Promise<CountryDto>;
  updateCountry(params: UpdateCountryParams): Promise<CountryDto | null>;
  deleteCountry(id: string): Promise<boolean>;
  getPersons(params: GetPersonsParams): Promise<PaginatedPersonsDto>;
  createPerson(params: CreatePersonParams): Promise<PersonDto>;
  updatePerson(params: UpdatePersonParams): Promise<PersonDto | null>;
  deletePerson(id: string): Promise<boolean>;
  getFilms(params: GetAdminFilmsParams): Promise<PaginatedAdminFilmsDto>;
  createFilm(params: CreateAdminFilmParams): Promise<AdminFilmDto>;
  updateFilm(params: UpdateAdminFilmParams): Promise<AdminFilmDto | null>;
  deleteFilm(id: string): Promise<boolean>;
}
