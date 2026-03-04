import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import {
  ADMIN_REPOSITORY,
  type AdminFilmDto,
  type AdminRepository,
  type CreateAdminFilmParams,
  type GetAdminFilmsParams,
  type PaginatedAdminFilmsDto,
  type UpdateAdminFilmParams,
} from '../../infrastructure';

@Injectable()
export class ManageFilmsService {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async getAll(params: GetAdminFilmsParams): Promise<PaginatedAdminFilmsDto> {
    return this.adminRepository.getFilms(params);
  }

  async create(params: CreateAdminFilmParams): Promise<AdminFilmDto> {
    try {
      return await this.adminRepository.createFilm(params);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Film with this original title already exists');
      }

      throw error;
    }
  }

  async update(params: UpdateAdminFilmParams): Promise<AdminFilmDto> {
    try {
      const film = await this.adminRepository.updateFilm(params);

      if (!film) {
        throw new NotFoundException('Film not found');
      }

      return film;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Film with this original title already exists');
      }

      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.adminRepository.deleteFilm(id);

    if (!deleted) {
      throw new NotFoundException('Film not found');
    }
  }
}
