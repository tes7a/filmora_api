import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  type FilmRatingStatsDto,
  FILMS_REPOSITORY,
  type FilmsRepository,
  type UpdateFilmRatingParams,
} from '../../infrastructure';

@Injectable()
export class UpdateFilmRatingService {
  constructor(
    @Inject(FILMS_REPOSITORY)
    private readonly filmsRepository: FilmsRepository,
  ) {}

  async execute(params: UpdateFilmRatingParams): Promise<FilmRatingStatsDto> {
    const result = await this.filmsRepository.updateFilmRating(params);

    if (!result) {
      throw new NotFoundException('Film not found');
    }

    return result;
  }
}
