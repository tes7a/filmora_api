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
  type CountryDto,
  type CreateCountryParams,
  type GetCountriesParams,
  type PaginatedCountriesDto,
  type UpdateCountryParams,
} from '../../infrastructure';

@Injectable()
export class ManageCountriesService {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async getAll(params: GetCountriesParams): Promise<PaginatedCountriesDto> {
    return this.adminRepository.getCountries(params);
  }

  async create(params: CreateCountryParams): Promise<CountryDto> {
    try {
      return await this.adminRepository.createCountry(params);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Country with this code or name already exists');
      }

      throw error;
    }
  }

  async update(params: UpdateCountryParams): Promise<CountryDto> {
    try {
      const country = await this.adminRepository.updateCountry(params);

      if (!country) {
        throw new NotFoundException('Country not found');
      }

      return country;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Country with this code or name already exists');
      }

      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.adminRepository.deleteCountry(id);

    if (!deleted) {
      throw new NotFoundException('Country not found');
    }
  }
}
