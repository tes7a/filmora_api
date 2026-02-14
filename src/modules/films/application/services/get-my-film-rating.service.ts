import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  FILMS_REPOSITORY,
  type FilmsRepository,
  type GetMyFilmRatingParams,
  type MyFilmRatingDto,
} from '../../infrastructure';

@Injectable()
export class GetMyFilmRatingService {
  constructor(
    @Inject(FILMS_REPOSITORY)
    private readonly filmsRepository: FilmsRepository,
  ) {}

  async execute(params: GetMyFilmRatingParams): Promise<MyFilmRatingDto> {
    const result = await this.filmsRepository.getMyFilmRating(params);

    if (!result) {
      throw new NotFoundException('Film not found');
    }

    return result;
  }
}
