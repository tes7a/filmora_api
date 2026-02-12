import type {
  AddUserRoleParams,
  AdminUserDto,
  GetUsersParams,
  PaginatedAdminUsersDto,
  UpdateUserStatusParams,
} from '../dto';

export type {
  AddUserRoleParams,
  AdminUserDto,
  GetUsersParams,
  PaginatedAdminUsersDto,
  UpdateUserStatusParams,
} from '../dto';

export const ADMIN_REPOSITORY = Symbol('ADMIN_REPOSITORY');

export interface AdminRepository {
  getUsers(params: GetUsersParams): Promise<PaginatedAdminUsersDto>;
  updateUserStatus(params: UpdateUserStatusParams): Promise<AdminUserDto | null>;
  addUserRole(params: AddUserRoleParams): Promise<AdminUserDto | null>;
}
