import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  type CommentTreeDto,
  FILMS_REPOSITORY,
  type FilmsRepository,
  type GetReviewCommentsParams,
} from '../../infrastructure';

@Injectable()
export class GetReviewCommentsService {
  constructor(
    @Inject(FILMS_REPOSITORY)
    private readonly filmsRepository: FilmsRepository,
  ) {}

  async execute(params: GetReviewCommentsParams): Promise<CommentTreeDto[]> {
    const comments = await this.filmsRepository.getReviewComments(params);

    if (!comments) {
      throw new NotFoundException('Review not found');
    }

    return comments;
  }
}
