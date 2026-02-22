import type {
  action_type,
  code_role,
  comment_status,
  complaint_status,
  review_status,
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
