import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  type CommentDto,
  COMMENTS_REPOSITORY,
  type CommentsRepository,
  type DeleteCommentParams,
} from '../../infrastructure';

@Injectable()
export class DeleteCommentService {
  constructor(
    @Inject(COMMENTS_REPOSITORY)
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute(params: DeleteCommentParams): Promise<CommentDto> {
    const comment = await this.commentsRepository.deleteComment(params);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }
}
