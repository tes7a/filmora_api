import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  FILMS_REPOSITORY,
  type FilmsRepository,
  type UpdatedReviewDto,
  type UpdateReviewParams,
} from '../../infrastructure';

@Injectable()
export class UpdateReviewService {
  constructor(
    @Inject(FILMS_REPOSITORY)
    private readonly filmsRepository: FilmsRepository,
  ) {}

  async execute(params: UpdateReviewParams): Promise<UpdatedReviewDto> {
    const review = await this.filmsRepository.updateReview(params);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }
}
