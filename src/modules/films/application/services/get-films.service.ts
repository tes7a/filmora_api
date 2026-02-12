import { Inject, Injectable } from '@nestjs/common';

import {
  FILMS_REPOSITORY,
  type FilmsRepository,
  type GetFilmsParams,
  type PaginatedFilmsDto,
} from '../../infrastructure';

@Injectable()
export class GetFilmsService {
  constructor(
    @Inject(FILMS_REPOSITORY)
    private readonly filmsRepository: FilmsRepository,
  ) {}

  async execute(params: GetFilmsParams): Promise<PaginatedFilmsDto> {
    return this.filmsRepository.getFilms(params);
  }
}
