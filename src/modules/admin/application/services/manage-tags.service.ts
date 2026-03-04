import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import {
  ADMIN_REPOSITORY,
  type AdminRepository,
  type CreateTagParams,
  type GetTagsParams,
  type PaginatedTagsDto,
  type TagDto,
  type UpdateTagParams,
} from '../../infrastructure';

@Injectable()
export class ManageTagsService {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async getAll(params: GetTagsParams): Promise<PaginatedTagsDto> {
    return this.adminRepository.getTags(params);
  }

  async create(params: CreateTagParams): Promise<TagDto> {
    try {
      return await this.adminRepository.createTag(params);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Tag with this name or slug already exists');
      }

      throw error;
    }
  }

  async update(params: UpdateTagParams): Promise<TagDto> {
    try {
      const tag = await this.adminRepository.updateTag(params);

      if (!tag) {
        throw new NotFoundException('Tag not found');
      }

      return tag;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Tag with this name or slug already exists');
      }

      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.adminRepository.deleteTag(id);

    if (!deleted) {
      throw new NotFoundException('Tag not found');
    }
  }
}
