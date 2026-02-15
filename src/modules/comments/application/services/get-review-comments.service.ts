import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  COMMENTS_REPOSITORY,
  type CommentsRepository,
  type CommentTreeDto,
  type GetReviewCommentsParams,
} from '../../infrastructure';

@Injectable()
export class GetReviewCommentsService {
  constructor(
    @Inject(COMMENTS_REPOSITORY)
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute(params: GetReviewCommentsParams): Promise<CommentTreeDto[]> {
    const comments = await this.commentsRepository.getReviewComments(params);

    if (!comments) {
      throw new NotFoundException('Review not found');
    }

    return comments;
  }
}
