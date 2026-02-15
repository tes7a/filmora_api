import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  type CreatedFilmReviewDto,
  type CreateFilmReviewParams,
  REVIEWS_REPOSITORY,
  type ReviewsRepository,
} from '../../infrastructure';

@Injectable()
export class CreateFilmReviewService {
  constructor(
    @Inject(REVIEWS_REPOSITORY)
    private readonly reviewsRepository: ReviewsRepository,
  ) {}

  async execute(params: CreateFilmReviewParams): Promise<CreatedFilmReviewDto> {
    try {
      const result = await this.reviewsRepository.createFilmReview(params);

      if (!result) {
        throw new NotFoundException('Film not found');
      }

      return result;
    } catch (error) {
      const prismaError = error as { code?: string } | undefined;

      if (prismaError?.code === 'P2002') {
        throw new ConflictException('User already has a review for this film');
      }

      if (error instanceof Error && error.message === 'REVIEW_ALREADY_EXISTS') {
        throw new ConflictException('User already has a review for this film');
      }

      throw error;
    }
  }
}
