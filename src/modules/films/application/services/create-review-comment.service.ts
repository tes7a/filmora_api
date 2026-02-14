import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  type CommentDto,
  type CreateReviewCommentParams,
  FILMS_REPOSITORY,
  type FilmsRepository,
} from '../../infrastructure';

@Injectable()
export class CreateReviewCommentService {
  constructor(
    @Inject(FILMS_REPOSITORY)
    private readonly filmsRepository: FilmsRepository,
  ) {}

  async execute(params: CreateReviewCommentParams): Promise<CommentDto> {
    try {
      const comment = await this.filmsRepository.createReviewComment(params);

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
