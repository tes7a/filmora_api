import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import {
  type CreateCustomListParams,
  LISTS_REPOSITORY,
  type ListsRepository,
  type UserListDto,
} from '../../infrastructure';

@Injectable()
export class CreateCustomListService {
  constructor(
    @Inject(LISTS_REPOSITORY)
    private readonly listsRepository: ListsRepository,
  ) {}

  async execute(params: CreateCustomListParams): Promise<UserListDto> {
    try {
      return await this.listsRepository.createCustomList(params);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('List with this name already exists');
      }

      throw error;
    }
  }
}
