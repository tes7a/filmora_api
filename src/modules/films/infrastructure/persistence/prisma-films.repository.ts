import { Injectable } from '@nestjs/common';
import { film_status,Prisma } from '@prisma/client';

import { PrismaService } from '@/shared';

import type { FilmListItemDto, GetFilmsParams } from '../dto';
import type { FilmsRepository } from './films.repository';

@Injectable()
export class PrismaFilmsRepository implements FilmsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getFilms(params: GetFilmsParams) {
    const { search, genres, years, sortBy, sortOrder, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.filmsWhereInput = {
      status: film_status.visible,
      ...(search
        ? {
            title: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          }
        : {}),
      ...(genres?.length
        ? {
            film_genres: {
              some: {
                genres: {
                  slug: { in: genres },
                },
              },
            },
          }
        : {}),
      ...(years?.length
        ? {
            release_year: { in: years },
          }
        : {}),
    };

    const orderBy: Prisma.filmsOrderByWithRelationInput[] =
      sortBy === 'rating'
        ? [{ average_rating: sortOrder }, { created_at: 'desc' }]
        : [{ release_year: sortOrder }, { created_at: 'desc' }];

    const [films, total] = await this.prisma.$transaction([
      this.prisma.films.findMany({
        where,
        select: {
          id: true,
          title: true,
          original_title: true,
          release_year: true,
          duration_min: true,
          age_rating: true,
          average_rating: true,
          ratings_count: true,
          created_at: true,
          film_genres: {
            select: {
              genres: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.films.count({ where }),
    ]);

    return {
      items: films.map((film) => this.toFilmListItem(film)),
      total,
      page,
      limit,
    };
  }

  private toFilmListItem(
    film: Prisma.filmsGetPayload<{
      select: {
        id: true;
        title: true;
        original_title: true;
        release_year: true;
        duration_min: true;
        age_rating: true;
        average_rating: true;
        ratings_count: true;
        created_at: true;
        film_genres: {
          select: {
            genres: {
              select: {
                id: true;
                name: true;
                slug: true;
              };
            };
          };
        };
      };
    }>,
  ): FilmListItemDto {
    return {
      id: film.id,
      title: film.title,
      originalTitle: film.original_title,
      releaseYear: film.release_year,
      durationMin: film.duration_min,
      ageRating: film.age_rating,
      averageRating: Number(film.average_rating),
      ratingsCount: film.ratings_count,
      createdAt: film.created_at,
      genres: film.film_genres.map((item) => ({
        id: item.genres.id,
        name: item.genres.name,
        slug: item.genres.slug,
      })),
    };
  }
}
