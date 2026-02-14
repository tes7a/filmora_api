import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  type FilmReviewDto,
  FILMS_REPOSITORY,
  type FilmsRepository,
  type GetFilmReviewsParams,
} from '../../infrastructure';

@Injectable()
export class GetFilmReviewsService {
  constructor(
    @Inject(FILMS_REPOSITORY)
    private readonly filmsRepository: FilmsRepository,
  ) {}

  async execute(params: GetFilmReviewsParams): Promise<FilmReviewDto[]> {
    const reviews = await this.filmsRepository.getFilmReviews(params);

    if (!reviews) {
      throw new NotFoundException('Film not found');
    }

    return reviews;
  }
}
