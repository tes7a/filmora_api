import type { code_role, user_status } from '@prisma/client';

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
