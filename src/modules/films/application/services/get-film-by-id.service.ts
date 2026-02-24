import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  type FilmDetailsDto,
  FILMS_REPOSITORY,
  type FilmsRepository,
} from '../../infrastructure';

@Injectable()
export class GetFilmByIdService {
  constructor(
    @Inject(FILMS_REPOSITORY)
    private readonly filmsRepository: FilmsRepository,
  ) {}

  async execute(filmId: string): Promise<FilmDetailsDto> {
    const film = await this.filmsRepository.getFilmById(filmId);

    if (!film) {
      throw new NotFoundException('Film not found');
    }

    return film;
  }
}
