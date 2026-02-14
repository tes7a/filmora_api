import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  type CommentDto,
  type DeleteCommentParams,
  FILMS_REPOSITORY,
  type FilmsRepository,
} from '../../infrastructure';

@Injectable()
export class DeleteCommentService {
  constructor(
    @Inject(FILMS_REPOSITORY)
    private readonly filmsRepository: FilmsRepository,
  ) {}

  async execute(params: DeleteCommentParams): Promise<CommentDto> {
    const comment = await this.filmsRepository.deleteComment(params);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }
}
