import { Inject, Injectable } from '@nestjs/common';

import {
  LISTS_REPOSITORY,
  type ListsRepository,
  type UserListDto,
} from '../../infrastructure';

@Injectable()
export class GetMyListsService {
  constructor(
    @Inject(LISTS_REPOSITORY)
    private readonly listsRepository: ListsRepository,
  ) {}

  async execute(userId: string): Promise<UserListDto[]> {
    return this.listsRepository.getMyLists(userId);
  }
}
