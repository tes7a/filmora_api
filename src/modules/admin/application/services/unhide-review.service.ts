import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  ADMIN_REPOSITORY,
  type AdminRepository,
  type ModerateCommentOrReviewParams,
  type ModerationActionDto,
} from '../../infrastructure';

@Injectable()
export class UnhideReviewService {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async execute(params: ModerateCommentOrReviewParams): Promise<ModerationActionDto> {
    const action = await this.adminRepository.unhideReview(params);

    if (!action) {
      throw new NotFoundException('Review not found');
    }

    return action;
  }
}
