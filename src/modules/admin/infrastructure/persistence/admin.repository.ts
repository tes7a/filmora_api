import type {
  AddUserRoleParams,
  AdminUserDto,
  BlockUserParams,
  DeleteReviewOrCommentParams,
  GetComplaintsParams,
  GetUsersParams,
  ModerateCommentOrReviewParams,
  ModerationActionDto,
  PaginatedAdminUsersDto,
  PaginatedComplaintsDto,
  UpdateUserStatusParams,
} from '../dto';

export type {
  AddUserRoleParams,
  AdminUserDto,
  BlockUserParams,
  DeleteReviewOrCommentParams,
  GetComplaintsParams,
  GetUsersParams,
  ModerateCommentOrReviewParams,
  ModerationActionDto,
  PaginatedAdminUsersDto,
  PaginatedComplaintsDto,
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
}
