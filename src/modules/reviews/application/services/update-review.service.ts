import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  REVIEWS_REPOSITORY,
  type ReviewsRepository,
  type UpdatedReviewDto,
  type UpdateReviewParams,
} from '../../infrastructure';

@Injectable()
export class UpdateReviewService {
  constructor(
    @Inject(REVIEWS_REPOSITORY)
    private readonly reviewsRepository: ReviewsRepository,
  ) {}

  async execute(params: UpdateReviewParams): Promise<UpdatedReviewDto> {
    const review = await this.reviewsRepository.updateReview(params);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }
}
