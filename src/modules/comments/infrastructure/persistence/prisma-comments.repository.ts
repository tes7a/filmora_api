import { Injectable } from '@nestjs/common';
import { comment_status, review_status } from '@prisma/client';

import { PrismaService } from '@/shared';

import type {
  CommentDto,
  CommentTreeDto,
  CreateReviewCommentParams,
  DeleteCommentParams,
  GetReviewCommentsParams,
  UpdateCommentParams,
} from '../dto';
import type { CommentsRepository } from './comments.repository';

@Injectable()
export class PrismaCommentsRepository implements CommentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createReviewComment(
    params: CreateReviewCommentParams,
  ): Promise<CommentDto | null> {
    const { reviewId, userId, body, parentId } = params;

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.reviews.findFirst({
        where: { id: reviewId },
        select: { id: true, user_id: true, status: true },
      });

      if (!review) {
        return null;
      }

      if (review.status === review_status.hidden && review.user_id !== userId) {
        return null;
      }

      if (parentId) {
        const parent = await tx.comments.findUnique({
          where: { id: parentId },
          select: {
            id: true,
            review_id: true,
          },
        });

        if (!parent) {
          throw new Error('PARENT_COMMENT_NOT_FOUND');
        }

        if (parent.review_id !== reviewId) {
          throw new Error('PARENT_COMMENT_WRONG_REVIEW');
        }
      }

      const comment = await tx.comments.create({
        data: {
          review_id: reviewId,
          user_id: userId,
          parent_id: parentId ?? null,
          body,
          status: comment_status.visible,
        },
        select: {
          id: true,
          review_id: true,
          user_id: true,
          parent_id: true,
          body: true,
          status: true,
          created_at: true,
          updated_at: true,
          users: {
            select: {
              id: true,
              display_name: true,
            },
          },
        },
      });

      return {
        commentId: comment.id,
        reviewId: comment.review_id,
        userId: comment.user_id,
        parentId: comment.parent_id,
        body: comment.body,
        status: comment.status,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        user: {
          id: comment.users.id,
          displayName: comment.users.display_name,
        },
      };
    });
  }

  async getReviewComments(
    params: GetReviewCommentsParams,
  ): Promise<CommentTreeDto[] | null> {
    const { reviewId, requesterUserId } = params;

    const review = await this.prisma.reviews.findFirst({
      where: { id: reviewId },
      select: { id: true, user_id: true, status: true },
    });

    if (!review) {
      return null;
    }

    if (
      review.status === review_status.hidden &&
      review.user_id !== requesterUserId
    ) {
      return null;
    }

    const comments = await this.prisma.comments.findMany({
      where: {
        review_id: reviewId,
        status: comment_status.visible,
      },
      select: {
        id: true,
        review_id: true,
        user_id: true,
        parent_id: true,
        body: true,
        status: true,
        created_at: true,
        updated_at: true,
        users: {
          select: {
            id: true,
            display_name: true,
          },
        },
      },
      orderBy: [{ created_at: 'asc' }, { id: 'asc' }],
    });

    const nodeById = new Map<string, CommentTreeDto>();
    const roots: CommentTreeDto[] = [];

    for (const comment of comments) {
      nodeById.set(comment.id, {
        commentId: comment.id,
        reviewId: comment.review_id,
        userId: comment.user_id,
        parentId: comment.parent_id,
        body: comment.body,
        status: comment.status,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        user: {
          id: comment.users.id,
          displayName: comment.users.display_name,
        },
        children: [],
      });
    }

    for (const comment of comments) {
      const node = nodeById.get(comment.id);

      if (!node) {
        continue;
      }

      if (comment.parent_id) {
        const parentNode = nodeById.get(comment.parent_id);

        if (parentNode) {
          parentNode.children.push(node);
          continue;
        }
      }

      roots.push(node);
    }

    return roots;
  }

  async updateComment(params: UpdateCommentParams): Promise<CommentDto | null> {
    const { commentId, userId, body } = params;

    const existingComment = await this.prisma.comments.findFirst({
      where: {
        id: commentId,
        user_id: userId,
        status: {
          not: comment_status.deleted,
        },
      },
      select: { id: true },
    });

    if (!existingComment) {
      return null;
    }

    const updatedComment = await this.prisma.comments.update({
      where: { id: commentId },
      data: {
        body,
        updated_at: new Date(),
      },
      select: {
        id: true,
        review_id: true,
        user_id: true,
        parent_id: true,
        body: true,
        status: true,
        created_at: true,
        updated_at: true,
        users: {
          select: {
            id: true,
            display_name: true,
          },
        },
      },
    });

    return {
      commentId: updatedComment.id,
      reviewId: updatedComment.review_id,
      userId: updatedComment.user_id,
      parentId: updatedComment.parent_id,
      body: updatedComment.body,
      status: updatedComment.status,
      createdAt: updatedComment.created_at,
      updatedAt: updatedComment.updated_at,
      user: {
        id: updatedComment.users.id,
        displayName: updatedComment.users.display_name,
      },
    };
  }

  async deleteComment(params: DeleteCommentParams): Promise<CommentDto | null> {
    const { commentId, userId } = params;

    const existingComment = await this.prisma.comments.findFirst({
      where: {
        id: commentId,
        user_id: userId,
        status: {
          not: comment_status.deleted,
        },
      },
      select: { id: true },
    });

    if (!existingComment) {
      return null;
    }

    const deletedComment = await this.prisma.comments.update({
      where: { id: commentId },
      data: {
        status: comment_status.deleted,
        updated_at: new Date(),
      },
      select: {
        id: true,
        review_id: true,
        user_id: true,
        parent_id: true,
        body: true,
        status: true,
        created_at: true,
        updated_at: true,
        users: {
          select: {
            id: true,
            display_name: true,
          },
        },
      },
    });

    return {
      commentId: deletedComment.id,
      reviewId: deletedComment.review_id,
      userId: deletedComment.user_id,
      parentId: deletedComment.parent_id,
      body: deletedComment.body,
      status: deletedComment.status,
      createdAt: deletedComment.created_at,
      updatedAt: deletedComment.updated_at,
      user: {
        id: deletedComment.users.id,
        displayName: deletedComment.users.display_name,
      },
    };
  }
}
