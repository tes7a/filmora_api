import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  type CommentDto,
  COMMENTS_REPOSITORY,
  type CommentsRepository,
  type CreateReviewCommentParams,
} from '../../infrastructure';

@Injectable()
export class CreateReviewCommentService {
  constructor(
    @Inject(COMMENTS_REPOSITORY)
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute(params: CreateReviewCommentParams): Promise<CommentDto> {
    try {
      const comment = await this.commentsRepository.createReviewComment(params);

      if (!comment) {
        throw new NotFoundException('Review not found');
      }

      return comment;
    } catch (error) {
      if (error instanceof Error && error.message === 'PARENT_COMMENT_NOT_FOUND') {
        throw new NotFoundException('Parent comment not found');
      }

      if (error instanceof Error && error.message === 'PARENT_COMMENT_WRONG_REVIEW') {
        throw new BadRequestException('Parent comment does not belong to this review');
      }

      throw error;
    }
  }
}
