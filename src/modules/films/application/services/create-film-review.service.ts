import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  type CreatedFilmReviewDto,
  type CreateFilmReviewParams,
  FILMS_REPOSITORY,
  type FilmsRepository,
} from '../../infrastructure';

@Injectable()
export class CreateFilmReviewService {
  constructor(
    @Inject(FILMS_REPOSITORY)
    private readonly filmsRepository: FilmsRepository,
  ) {}

  async execute(params: CreateFilmReviewParams): Promise<CreatedFilmReviewDto> {
    try {
      const result = await this.filmsRepository.createFilmReview(params);

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
