import type { AdminUserDto } from '../dto';

export type { AdminUserDto } from '../dto';

export const ADMIN_REPOSITORY = Symbol('ADMIN_REPOSITORY');

export interface AdminRepository {
  getUsers(excludeUserId: string): Promise<AdminUserDto[]>;
}
