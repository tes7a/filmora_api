import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  ADMIN_REPOSITORY,
  type AdminRepository,
  type ModerateCommentOrReviewParams,
  type ModerationActionDto,
} from '../../infrastructure';

@Injectable()
export class HideCommentService {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async execute(params: ModerateCommentOrReviewParams): Promise<ModerationActionDto> {
    const action = await this.adminRepository.hideComment(params);

    if (!action) {
      throw new NotFoundException('Comment not found');
    }

    return action;
  }
}
