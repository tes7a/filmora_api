import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  type FilmFullDto,
  FILMS_REPOSITORY,
  type FilmsRepository,
} from '../../infrastructure';

@Injectable()
export class GetFilmFullByIdService {
  constructor(
    @Inject(FILMS_REPOSITORY)
    private readonly filmsRepository: FilmsRepository,
  ) {}

  async execute(filmId: string): Promise<FilmFullDto> {
    const film = await this.filmsRepository.getFilmFullById(filmId);

    if (!film) {
      throw new NotFoundException('Film not found');
    }

    return film;
  }
}
