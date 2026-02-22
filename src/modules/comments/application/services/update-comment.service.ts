import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  type CommentDto,
  COMMENTS_REPOSITORY,
  type CommentsRepository,
  type UpdateCommentParams,
} from '../../infrastructure';

@Injectable()
export class UpdateCommentService {
  constructor(
    @Inject(COMMENTS_REPOSITORY)
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute(params: UpdateCommentParams): Promise<CommentDto> {
    const comment = await this.commentsRepository.updateComment(params);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }
}
