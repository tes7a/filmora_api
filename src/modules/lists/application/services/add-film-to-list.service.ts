import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  type AddFilmToListParams,
  LISTS_REPOSITORY,
  type ListsRepository,
  type UserListDto,
} from '../../infrastructure';

@Injectable()
export class AddFilmToListService {
  constructor(
    @Inject(LISTS_REPOSITORY)
    private readonly listsRepository: ListsRepository,
  ) {}

  async execute(params: AddFilmToListParams): Promise<UserListDto> {
    try {
      const list = await this.listsRepository.addFilmToList(params);

      if (!list) {
        throw new NotFoundException('List or film not found');
      }

      return list;
    } catch (error) {
      if (error instanceof Error && error.message === 'FILM_ALREADY_IN_LIST') {
        throw new ConflictException('Film is already in this list');
      }

      throw error;
    }
  }
}
