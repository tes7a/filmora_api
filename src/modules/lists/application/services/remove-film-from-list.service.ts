import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  LISTS_REPOSITORY,
  type ListsRepository,
  type RemoveFilmFromListParams,
  type UserListDto,
} from '../../infrastructure';

@Injectable()
export class RemoveFilmFromListService {
  constructor(
    @Inject(LISTS_REPOSITORY)
    private readonly listsRepository: ListsRepository,
  ) {}

  async execute(params: RemoveFilmFromListParams): Promise<UserListDto> {
    const list = await this.listsRepository.removeFilmFromList(params);

    if (!list) {
      throw new NotFoundException('List item not found');
    }

    return list;
  }
}
