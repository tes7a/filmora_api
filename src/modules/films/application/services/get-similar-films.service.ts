import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  FILMS_REPOSITORY,
  type FilmsRepository,
  type GetSimilarFilmsParams,
  type PaginatedSimilarFilmsDto,
} from '../../infrastructure';

@Injectable()
export class GetSimilarFilmsService {
  constructor(
    @Inject(FILMS_REPOSITORY)
    private readonly filmsRepository: FilmsRepository,
  ) {}

  async execute(
    filmId: string,
    params: GetSimilarFilmsParams,
  ): Promise<PaginatedSimilarFilmsDto> {
    const result = await this.filmsRepository.getSimilarFilms(filmId, params);

    if (!result) {
      throw new NotFoundException('Film not found');
    }

    return result;
  }
}
