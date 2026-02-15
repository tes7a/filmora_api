import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  type FilmReviewDto,
  type GetFilmReviewsParams,
  REVIEWS_REPOSITORY,
  type ReviewsRepository,
} from '../../infrastructure';

@Injectable()
export class GetFilmReviewsService {
  constructor(
    @Inject(REVIEWS_REPOSITORY)
    private readonly reviewsRepository: ReviewsRepository,
  ) {}

  async execute(params: GetFilmReviewsParams): Promise<FilmReviewDto[]> {
    const reviews = await this.reviewsRepository.getFilmReviews(params);

    if (!reviews) {
      throw new NotFoundException('Film not found');
    }

    return reviews;
  }
}
