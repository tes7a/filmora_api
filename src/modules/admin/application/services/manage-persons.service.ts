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
  type CreatePersonParams,
  type GetPersonsParams,
  type PaginatedPersonsDto,
  type PersonDto,
  type UpdatePersonParams,
} from '../../infrastructure';

@Injectable()
export class ManagePersonsService {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: AdminRepository,
  ) {}

  async getAll(params: GetPersonsParams): Promise<PaginatedPersonsDto> {
    return this.adminRepository.getPersons(params);
  }

  async create(params: CreatePersonParams): Promise<PersonDto> {
    try {
      return await this.adminRepository.createPerson(params);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Person with this slug already exists');
      }

      throw error;
    }
  }

  async update(params: UpdatePersonParams): Promise<PersonDto> {
    try {
      const person = await this.adminRepository.updatePerson(params);

      if (!person) {
        throw new NotFoundException('Person not found');
      }

      return person;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Person with this slug already exists');
      }

      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.adminRepository.deletePerson(id);

    if (!deleted) {
      throw new NotFoundException('Person not found');
    }
  }
}
