import type {
  AddFilmToListParams,
  CreateCustomListParams,
  RemoveFilmFromListParams,
  UpdateListParams,
  UserListDto,
} from '../dto';

export type {
  AddFilmToListParams,
  CreateCustomListParams,
  RemoveFilmFromListParams,
  UpdateListParams,
  UserListDto,
} from '../dto';

export const LISTS_REPOSITORY = Symbol('LISTS_REPOSITORY');

export interface ListsRepository {
  getMyLists(userId: string): Promise<UserListDto[]>;
  createCustomList(params: CreateCustomListParams): Promise<UserListDto>;
  addFilmToList(params: AddFilmToListParams): Promise<UserListDto | null>;
  removeFilmFromList(params: RemoveFilmFromListParams): Promise<UserListDto | null>;
  updateList(params: UpdateListParams): Promise<UserListDto | null>;
}
