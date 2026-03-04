import { Injectable } from '@nestjs/common';
import { person_status, Prisma } from '@prisma/client';

import { PrismaService } from '@/shared';

import type {
  GetPersonsParams,
  PaginatedPersonsDto,
  PersonDetailsDto,
  PersonListItemDto,
  PersonsSortBy,
} from '../dto';
import type { PersonsRepository } from './persons.repository';

@Injectable()
export class PrismaPersonsRepository implements PersonsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getPersons(params: GetPersonsParams): Promise<PaginatedPersonsDto> {
    const { q, page, pageSize, sortBy, sortOrder } = params;
    const skip = (page - 1) * pageSize;

    const sortMap: Record<PersonsSortBy, 'full_name' | 'created_at' | 'updated_at'> = {
      fullName: 'full_name',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };

    const where: Prisma.personsWhereInput = {
      status: person_status.visible,
      ...(q
        ? {
            OR: [
              {
                full_name: {
                  contains: q,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                slug: {
                  contains: q,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : {}),
    };

    const [persons, total] = await this.prisma.$transaction([
      this.prisma.persons.findMany({
        where,
        select: {
          id: true,
          full_name: true,
          slug: true,
          birth_date: true,
          death_date: true,
          bio: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: { [sortMap[sortBy]]: sortOrder },
        skip,
        take: pageSize,
      }),
      this.prisma.persons.count({ where }),
    ]);

    return {
      items: persons.map((person) => this.toListDto(person)),
      total,
      page,
      pageSize,
    };
  }

  async getPersonById(personId: string): Promise<PersonDetailsDto | null> {
    const person = await this.prisma.persons.findFirst({
      where: {
        id: personId,
        status: person_status.visible,
      },
      select: {
        id: true,
        full_name: true,
        slug: true,
        birth_date: true,
        death_date: true,
        bio: true,
        created_at: true,
        updated_at: true,
        film_person_roles: {
          where: {
            films: {
              status: 'visible',
            },
          },
          select: {
            role_type: true,
            character_name: true,
            billing_order: true,
            films: {
              select: {
                id: true,
                title: true,
                original_title: true,
                release_year: true,
              },
            },
          },
          orderBy: [{ billing_order: 'asc' }, { created_at: 'asc' }],
        },
      },
    });

    if (!person) {
      return null;
    }

    return {
      ...this.toListDto(person),
      films: person.film_person_roles.map((item) => ({
        filmId: item.films.id,
        title: item.films.title,
        originalTitle: item.films.original_title,
        releaseYear: item.films.release_year,
        roleType: item.role_type,
        characterName: item.character_name,
        billingOrder: item.billing_order,
      })),
    };
  }

  private toListDto(person: {
    id: string;
    full_name: string;
    slug: string;
    birth_date: Date | null;
    death_date: Date | null;
    bio: string | null;
    created_at: Date;
    updated_at: Date;
  }): PersonListItemDto {
    return {
      id: person.id,
      fullName: person.full_name,
      slug: person.slug,
      birthDate: person.birth_date,
      deathDate: person.death_date,
      bio: person.bio,
      createdAt: person.created_at,
      updatedAt: person.updated_at,
    };
  }
}
