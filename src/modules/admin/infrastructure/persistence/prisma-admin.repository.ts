import { Injectable } from '@nestjs/common';
import {
  action_type,
  comment_status,
  complaint_status,
  Prisma,
  review_status,
  target_type,
  target_type_ext,
  user_status,
} from '@prisma/client';

import { PrismaService } from '@/shared';

import type {
  AddUserRoleParams,
  AdminUserDto,
  BlockUserParams,
  DeleteReviewOrCommentParams,
  GetComplaintsParams,
  GetUsersParams,
  ModerateCommentOrReviewParams,
  ModerationActionDto,
  UpdateUserStatusParams,
} from '../dto';
import type { AdminRepository } from './admin.repository';

@Injectable()
export class PrismaAdminRepository implements AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(params: GetUsersParams) {
    const { excludeUserId, page, limit, sortBy, sortOrder, search } = params;
    const skip = (page - 1) * limit;

    const sortMap = {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      lastLoginAt: 'last_login_at',
      email: 'email',
      displayName: 'display_name',
      status: 'status',
    } as const;

    const where: Prisma.usersWhereInput = {
      id: { not: excludeUserId },
      ...(search
        ? {
            OR: [
              {
                email: { contains: search, mode: Prisma.QueryMode.insensitive },
              },
              {
                display_name: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : {}),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.users.findMany({
        where,
        select: {
          id: true,
          email: true,
          display_name: true,
          status: true,
          created_at: true,
          updated_at: true,
          last_login_at: true,
          user_roles: {
            select: {
              roles: {
                select: {
                  code: true,
                },
              },
            },
          },
        },
        orderBy: { [sortMap[sortBy]]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.users.count({ where }),
    ]);

    return {
      items: users.map((user) => ({
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        status: user.status,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLoginAt: user.last_login_at,
        roles: user.user_roles.map((ur) => ur.roles.code),
      })),
      total,
      page,
      limit,
    };
  }

  async getComplaints(params: GetComplaintsParams) {
    const { status, page, limit } = params;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [complaints, total] = await this.prisma.$transaction([
      this.prisma.complaints.findMany({
        where,
        select: {
          id: true,
          user_id: true,
          target_type: true,
          target_id: true,
          reason: true,
          status: true,
          created_at: true,
          updated_at: true,
          resolved_at: true,
          users: {
            select: {
              id: true,
              display_name: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.complaints.count({ where }),
    ]);

    return {
      items: complaints.map((item) => ({
        id: item.id,
        userId: item.user_id,
        targetType: item.target_type,
        targetId: item.target_id,
        reason: item.reason,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        resolvedAt: item.resolved_at,
        user: {
          id: item.users.id,
          displayName: item.users.display_name,
        },
      })),
      total,
      page,
      limit,
    };
  }

  async updateUserStatus(
    params: UpdateUserStatusParams,
  ): Promise<AdminUserDto | null> {
    try {
      await this.prisma.users.update({
        where: { id: params.userId },
        data: { status: params.status, updated_at: new Date() },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null;
      }

      throw error;
    }

    return this.getUserById(params.userId);
  }

  async addUserRole(params: AddUserRoleParams): Promise<AdminUserDto | null> {
    const user = await this.prisma.users.findUnique({
      where: { id: params.userId },
      select: { id: true },
    });

    if (!user) {
      return null;
    }

    const role = await this.prisma.roles.findFirst({
      where: { code: params.roleCode },
      select: { id: true },
    });

    if (!role) {
      throw new Error('ROLE_NOT_FOUND');
    }

    try {
      await this.prisma.user_roles.create({
        data: {
          user_id: params.userId,
          role_id: role.id,
          assigned_at: new Date(),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new Error('ROLE_ALREADY_ASSIGNED');
      }

      throw error;
    }

    return this.getUserById(params.userId);
  }

  async hideReview(
    params: ModerateCommentOrReviewParams,
  ): Promise<ModerationActionDto | null> {
    return this.moderateReview(params, review_status.hidden, action_type.hide_review);
  }

  async unhideReview(
    params: ModerateCommentOrReviewParams,
  ): Promise<ModerationActionDto | null> {
    return this.moderateReview(params, review_status.visible, action_type.unhide_review);
  }

  async deleteReview(
    params: DeleteReviewOrCommentParams,
  ): Promise<ModerationActionDto | null> {
    const { targetId, moderatorId, reason, complaintId } = params;

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.reviews.findFirst({
        where: { id: targetId },
        select: { id: true },
      });

      if (!review) {
        return null;
      }

      await tx.reviews.delete({
        where: { id: targetId },
      });

      const linkedComplaintId = await this.resolveComplaint(
        tx,
        complaintId,
        target_type.review,
        targetId,
      );

      const action = await tx.moderation_actions.create({
        data: {
          moderator_id: moderatorId,
          target_type: target_type_ext.review,
          target_id: targetId,
          action_type: action_type.hide_review,
          reason,
          complaint_id: linkedComplaintId,
        },
        select: {
          id: true,
          moderator_id: true,
          target_type: true,
          target_id: true,
          action_type: true,
          reason: true,
          complaint_id: true,
          created_at: true,
        },
      });

      return {
        id: action.id,
        moderatorId: action.moderator_id,
        targetType: action.target_type,
        targetId: action.target_id,
        actionType: action.action_type,
        reason: action.reason,
        complaintId: action.complaint_id,
        createdAt: action.created_at,
        reviewStatus: review_status.deleted,
      };
    });
  }

  async hideComment(
    params: ModerateCommentOrReviewParams,
  ): Promise<ModerationActionDto | null> {
    const { targetId, moderatorId, reason, complaintId } = params;

    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.comments.findFirst({
        where: { id: targetId },
        select: { id: true },
      });

      if (!comment) {
        return null;
      }

      await tx.comments.update({
        where: { id: targetId },
        data: {
          status: comment_status.hidden,
          updated_at: new Date(),
        },
      });

      const linkedComplaintId = await this.resolveComplaint(
        tx,
        complaintId,
        target_type.comment,
        targetId,
      );

      const action = await tx.moderation_actions.create({
        data: {
          moderator_id: moderatorId,
          target_type: target_type_ext.comment,
          target_id: targetId,
          action_type: action_type.hide_comment,
          reason,
          complaint_id: linkedComplaintId,
        },
        select: {
          id: true,
          moderator_id: true,
          target_type: true,
          target_id: true,
          action_type: true,
          reason: true,
          complaint_id: true,
          created_at: true,
        },
      });

      return {
        id: action.id,
        moderatorId: action.moderator_id,
        targetType: action.target_type,
        targetId: action.target_id,
        actionType: action.action_type,
        reason: action.reason,
        complaintId: action.complaint_id,
        createdAt: action.created_at,
        commentStatus: comment_status.hidden,
      };
    });
  }

  async unhideComment(
    params: ModerateCommentOrReviewParams,
  ): Promise<ModerationActionDto | null> {
    const { targetId, moderatorId, reason, complaintId } = params;

    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.comments.findFirst({
        where: { id: targetId },
        select: { id: true },
      });

      if (!comment) {
        return null;
      }

      await tx.comments.update({
        where: { id: targetId },
        data: {
          status: comment_status.visible,
          updated_at: new Date(),
        },
      });

      const linkedComplaintId = await this.resolveComplaint(
        tx,
        complaintId,
        target_type.comment,
        targetId,
      );

      const action = await tx.moderation_actions.create({
        data: {
          moderator_id: moderatorId,
          target_type: target_type_ext.comment,
          target_id: targetId,
          action_type: action_type.unhide_comment,
          reason,
          complaint_id: linkedComplaintId,
        },
        select: {
          id: true,
          moderator_id: true,
          target_type: true,
          target_id: true,
          action_type: true,
          reason: true,
          complaint_id: true,
          created_at: true,
        },
      });

      return {
        id: action.id,
        moderatorId: action.moderator_id,
        targetType: action.target_type,
        targetId: action.target_id,
        actionType: action.action_type,
        reason: action.reason,
        complaintId: action.complaint_id,
        createdAt: action.created_at,
        commentStatus: comment_status.visible,
      };
    });
  }

  async deleteComment(
    params: DeleteReviewOrCommentParams,
  ): Promise<ModerationActionDto | null> {
    const { targetId, moderatorId, reason, complaintId } = params;

    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.comments.findFirst({
        where: { id: targetId },
        select: { id: true },
      });

      if (!comment) {
        return null;
      }

      await tx.comments.delete({
        where: { id: targetId },
      });

      const linkedComplaintId = await this.resolveComplaint(
        tx,
        complaintId,
        target_type.comment,
        targetId,
      );

      const action = await tx.moderation_actions.create({
        data: {
          moderator_id: moderatorId,
          target_type: target_type_ext.comment,
          target_id: targetId,
          action_type: action_type.hide_comment,
          reason,
          complaint_id: linkedComplaintId,
        },
        select: {
          id: true,
          moderator_id: true,
          target_type: true,
          target_id: true,
          action_type: true,
          reason: true,
          complaint_id: true,
          created_at: true,
        },
      });

      return {
        id: action.id,
        moderatorId: action.moderator_id,
        targetType: action.target_type,
        targetId: action.target_id,
        actionType: action.action_type,
        reason: action.reason,
        complaintId: action.complaint_id,
        createdAt: action.created_at,
        commentStatus: comment_status.deleted,
      };
    });
  }

  async blockUser(params: BlockUserParams): Promise<ModerationActionDto | null> {
    const { userId, moderatorId, reason, complaintId } = params;

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.users.findFirst({
        where: { id: userId },
        select: { id: true },
      });

      if (!user) {
        return null;
      }

      await tx.users.update({
        where: { id: userId },
        data: {
          status: user_status.blocked,
          updated_at: new Date(),
        },
      });

      let linkedComplaintId: string | null = null;

      if (complaintId) {
        const complaint = await tx.complaints.findFirst({
          where: { id: complaintId },
          select: { id: true },
        });

        if (complaint) {
          linkedComplaintId = complaint.id;
          await tx.complaints.update({
            where: { id: complaintId },
            data: {
              status: complaint_status.resolved,
              resolved_at: new Date(),
              updated_at: new Date(),
            },
          });
        }
      }

      const action = await tx.moderation_actions.create({
        data: {
          moderator_id: moderatorId,
          target_type: target_type_ext.user,
          target_id: userId,
          action_type: action_type.block_user,
          reason,
          complaint_id: linkedComplaintId,
        },
        select: {
          id: true,
          moderator_id: true,
          target_type: true,
          target_id: true,
          action_type: true,
          reason: true,
          complaint_id: true,
          created_at: true,
        },
      });

      return {
        id: action.id,
        moderatorId: action.moderator_id,
        targetType: action.target_type,
        targetId: action.target_id,
        actionType: action.action_type,
        reason: action.reason,
        complaintId: action.complaint_id,
        createdAt: action.created_at,
      };
    });
  }

  private async getUserById(userId: string): Promise<AdminUserDto | null> {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        display_name: true,
        status: true,
        created_at: true,
        updated_at: true,
        last_login_at: true,
        user_roles: {
          select: {
            roles: {
              select: {
                code: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      status: user.status,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLoginAt: user.last_login_at,
      roles: user.user_roles.map((ur) => ur.roles.code),
    };
  }

  private async moderateReview(
    params: ModerateCommentOrReviewParams,
    nextStatus: review_status,
    actionType: action_type,
  ): Promise<ModerationActionDto | null> {
    const { targetId, moderatorId, reason, complaintId } = params;

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.reviews.findFirst({
        where: { id: targetId },
        select: { id: true },
      });

      if (!review) {
        return null;
      }

      await tx.reviews.update({
        where: { id: targetId },
        data: {
          status: nextStatus,
          updated_at: new Date(),
        },
      });

      const linkedComplaintId = await this.resolveComplaint(
        tx,
        complaintId,
        target_type.review,
        targetId,
      );

      const action = await tx.moderation_actions.create({
        data: {
          moderator_id: moderatorId,
          target_type: target_type_ext.review,
          target_id: targetId,
          action_type: actionType,
          reason,
          complaint_id: linkedComplaintId,
        },
        select: {
          id: true,
          moderator_id: true,
          target_type: true,
          target_id: true,
          action_type: true,
          reason: true,
          complaint_id: true,
          created_at: true,
        },
      });

      return {
        id: action.id,
        moderatorId: action.moderator_id,
        targetType: action.target_type,
        targetId: action.target_id,
        actionType: action.action_type,
        reason: action.reason,
        complaintId: action.complaint_id,
        createdAt: action.created_at,
        reviewStatus: nextStatus,
      };
    });
  }

  private async resolveComplaint(
    tx: Prisma.TransactionClient,
    complaintId: string | undefined,
    expectedTargetType: target_type,
    expectedTargetId: string,
  ): Promise<string | null> {
    if (!complaintId) {
      return null;
    }

    const complaint = await tx.complaints.findFirst({
      where: { id: complaintId },
      select: {
        id: true,
        target_type: true,
        target_id: true,
      },
    });

    if (!complaint) {
      return null;
    }

    if (
      complaint.target_type !== expectedTargetType ||
      complaint.target_id !== expectedTargetId
    ) {
      return null;
    }

    await tx.complaints.update({
      where: { id: complaintId },
      data: {
        status: complaint_status.resolved,
        resolved_at: new Date(),
        updated_at: new Date(),
      },
    });

    return complaint.id;
  }
}
