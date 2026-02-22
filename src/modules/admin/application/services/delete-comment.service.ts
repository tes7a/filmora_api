import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  ADMIN_REPOSITORY,
  type AdminRepository,
  type DeleteReviewOrCommentParams,
  type ModerationActionDto,
} from '../../infrastructure';

@Injectable()
export class DeleteCommentService {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async execute(params: DeleteReviewOrCommentParams): Promise<ModerationActionDto> {
    const action = await this.adminRepository.deleteComment(params);

    if (!action) {
      throw new NotFoundException('Comment not found');
    }

    return action;
  }
}
