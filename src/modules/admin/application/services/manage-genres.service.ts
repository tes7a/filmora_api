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
  type CreateGenreParams,
  type GenreDto,
  type GetGenresParams,
  type MergeGenreParams,
  type PaginatedGenresDto,
  type UpdateGenreParams,
} from '../../infrastructure';

@Injectable()
export class ManageGenresService {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async getAll(params: GetGenresParams): Promise<PaginatedGenresDto> {
    return this.adminRepository.getGenres(params);
  }

  async create(params: CreateGenreParams): Promise<GenreDto> {
    try {
      return await this.adminRepository.createGenre(params);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Genre with this name or slug already exists');
      }

      throw error;
    }
  }

  async update(params: UpdateGenreParams): Promise<GenreDto> {
    try {
      const genre = await this.adminRepository.updateGenre(params);

      if (!genre) {
        throw new NotFoundException('Genre not found');
      }

      return genre;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Genre with this name or slug already exists');
      }

      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.adminRepository.deleteGenre(id);

    if (!deleted) {
      throw new NotFoundException('Genre not found');
    }
  }

  async merge(params: MergeGenreParams): Promise<GenreDto> {
    try {
      const genre = await this.adminRepository.mergeGenre(params);

      if (!genre) {
        throw new NotFoundException('Source or target genre not found');
      }

      return genre;
    } catch (error) {
      if (error instanceof Error && error.message === 'GENRE_MERGE_SAME_TARGET') {
        throw new ConflictException('Source and target genre must be different');
      }

      throw error;
    }
  }
}
