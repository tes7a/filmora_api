import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  type CommentDto,
  FILMS_REPOSITORY,
  type FilmsRepository,
  type UpdateCommentParams,
} from '../../infrastructure';

@Injectable()
export class UpdateCommentService {
  constructor(
    @Inject(FILMS_REPOSITORY)
    private readonly filmsRepository: FilmsRepository,
  ) {}

  async execute(params: UpdateCommentParams): Promise<CommentDto> {
    const comment = await this.filmsRepository.updateComment(params);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }
}
