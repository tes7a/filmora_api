import type { GetUsersParams, PaginatedAdminUsersDto } from '../dto';

export type {
  AdminUserDto,
  GetUsersParams,
  PaginatedAdminUsersDto,
} from '../dto';

export const ADMIN_REPOSITORY = Symbol('ADMIN_REPOSITORY');

export interface AdminRepository {
  getUsers(params: GetUsersParams): Promise<PaginatedAdminUsersDto>;
}
