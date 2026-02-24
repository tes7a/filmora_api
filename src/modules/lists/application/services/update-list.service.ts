import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  LISTS_REPOSITORY,
  type ListsRepository,
  type UpdateListParams,
  type UserListDto,
} from '../../infrastructure';

@Injectable()
export class UpdateListService {
  constructor(
    @Inject(LISTS_REPOSITORY)
    private readonly listsRepository: ListsRepository,
  ) {}

  async execute(params: UpdateListParams): Promise<UserListDto> {
    try {
      const list = await this.listsRepository.updateList(params);

      if (!list) {
        throw new NotFoundException('List not found');
      }

      return list;
    } catch (error) {
      if (error instanceof Error && error.message === 'LIST_NOT_CUSTOM') {
        throw new ConflictException('Only custom lists can be updated');
      }

      if (error instanceof Error && error.message === 'LIST_NAME_ALREADY_EXISTS') {
        throw new ConflictException('List with this name already exists');
      }

      throw error;
    }
  }
}
