import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  ADMIN_REPOSITORY,
  type AdminRepository,
  type DeleteReviewOrCommentParams,
  type ModerationActionDto,
} from '../../infrastructure';

@Injectable()
export class DeleteReviewService {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async execute(params: DeleteReviewOrCommentParams): Promise<ModerationActionDto> {
    const action = await this.adminRepository.deleteReview(params);

    if (!action) {
      throw new NotFoundException('Review not found');
    }

    return action;
  }
}
