import { Injectable } from '@nestjs/common';
import { film_status, Prisma } from '@prisma/client';

import { PrismaService } from '@/shared';

import type {
  FilmDetailsDto,
  FilmFullDto,
  FilmListItemDto,
  FilmRatingStatsDto,
  GetFilmsParams,
  GetMyFilmRatingParams,
  MyFilmRatingDto,
  UpdateFilmRatingParams,
} from '../dto';
import type { FilmsRepository } from './films.repository';

@Injectable()
export class PrismaFilmsRepository implements FilmsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getFilms(params: GetFilmsParams) {
    const {
      q,
      genreIds,
      tagIds,
      countryIds,
      yearFrom,
      yearTo,
      ratingFrom,
      ratingTo,
      sortBy,
      sortOrder,
      page,
      pageSize,
    } = params;
    const skip = (page - 1) * pageSize;

    const releaseYearFilter: Prisma.IntFilter = {};
    const averageRatingFilter: Prisma.DecimalFilter = {};

    if (yearFrom !== undefined) {
      releaseYearFilter.gte = yearFrom;
    }

    if (yearTo !== undefined) {
      releaseYearFilter.lte = yearTo;
    }

    if (ratingFrom !== undefined) {
      averageRatingFilter.gte = new Prisma.Decimal(ratingFrom);
    }

    if (ratingTo !== undefined) {
      averageRatingFilter.lte = new Prisma.Decimal(ratingTo);
    }

    const where: Prisma.filmsWhereInput = {
      status: film_status.visible,
      ...(q
        ? {
            title: {
              contains: q,
              mode: Prisma.QueryMode.insensitive,
            },
          }
        : {}),
      ...(genreIds?.length
        ? {
            film_genres: {
              some: {
                genre_id: { in: genreIds },
              },
            },
          }
        : {}),
      ...(tagIds?.length
        ? {
            film_tags: {
              some: {
                tag_id: { in: tagIds },
              },
            },
          }
        : {}),
      ...(countryIds?.length
        ? {
            film_countries: {
              some: {
                country_id: { in: countryIds },
              },
            },
          }
        : {}),
      ...(Object.keys(releaseYearFilter).length
        ? {
            release_year: releaseYearFilter,
          }
        : {}),
      ...(Object.keys(averageRatingFilter).length
        ? {
            average_rating: averageRatingFilter,
          }
        : {}),
    };

    const orderBy: Prisma.filmsOrderByWithRelationInput[] = [];

    if (sortBy === 'rating') {
      orderBy.push({ average_rating: sortOrder });
    } else if (sortBy === 'popularity') {
      orderBy.push({ popularity_score: sortOrder });
    } else {
      orderBy.push({ release_year: sortOrder });
    }

    orderBy.push({ created_at: 'desc' });

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
        take: pageSize,
      }),
      this.prisma.films.count({ where }),
    ]);

    return {
      items: films.map((film) => this.toFilmListItem(film)),
      total,
      page,
      pageSize,
    };
  }

  async updateFilmRating(
    params: UpdateFilmRatingParams,
  ): Promise<FilmRatingStatsDto | null> {
    const { filmId, userId, score } = params;

    return this.prisma.$transaction(async (tx) => {
      const film = await tx.films.findUnique({
        where: { id: filmId },
        select: { id: true },
      });

      if (!film) {
        return null;
      }

      await tx.ratings.upsert({
        where: {
          user_id_film_id: {
            user_id: userId,
            film_id: filmId,
          },
        },
        create: {
          user_id: userId,
          film_id: filmId,
          score,
        },
        update: {
          score,
          updated_at: new Date(),
        },
      });

      const aggregate = await tx.ratings.aggregate({
        where: { film_id: filmId },
        _avg: { score: true },
        _count: { _all: true },
      });

      const averageRating = Number((aggregate._avg.score ?? 0).toFixed(1));
      const ratingsCount = aggregate._count._all;

      await tx.films.update({
        where: { id: filmId },
        data: {
          average_rating: new Prisma.Decimal(averageRating),
          ratings_count: ratingsCount,
          updated_at: new Date(),
        },
      });

      return {
        filmId,
        userScore: score,
        averageRating,
        ratingsCount,
      };
    });
  }

  async getMyFilmRating(
    params: GetMyFilmRatingParams,
  ): Promise<MyFilmRatingDto | null> {
    const { filmId, userId } = params;

    const film = await this.prisma.films.findUnique({
      where: { id: filmId },
      select: { id: true },
    });

    if (!film) {
      return null;
    }

    const rating = await this.prisma.ratings.findUnique({
      where: {
        user_id_film_id: {
          user_id: userId,
          film_id: filmId,
        },
      },
      select: { score: true },
    });

    return {
      filmId,
      userScore: rating?.score ?? null,
    };
  }

  async getFilmById(filmId: string): Promise<FilmDetailsDto | null> {
    const film = await this.getFilmDetailsById(filmId);

    if (!film) {
      return null;
    }

    return this.toFilmDetailsDto(film);
  }

  async getFilmFullById(filmId: string): Promise<FilmFullDto | null> {
    const film = await this.getFilmDetailsById(filmId);

    if (!film) {
      return null;
    }

    const genreIds = film.film_genres.map((item) => item.genre_id);
    const tagIds = film.film_tags.map((item) => item.tag_id);
    const personIds = film.film_person_roles.map((item) => item.person_id);

    const similarFilms = genreIds.length || tagIds.length
      ? await this.prisma.films.findMany({
          where: {
            id: { not: filmId },
            status: film_status.visible,
            OR: [
              ...(genreIds.length
                ? [
                    {
                      film_genres: {
                        some: {
                          genre_id: { in: genreIds },
                        },
                      },
                    },
                  ]
                : []),
              ...(tagIds.length
                ? [
                    {
                      film_tags: {
                        some: {
                          tag_id: { in: tagIds },
                        },
                      },
                    },
                  ]
                : []),
            ],
          },
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
          orderBy: [{ average_rating: 'desc' }, { created_at: 'desc' }],
          take: 12,
        })
      : [];

    const samePersonFilms = personIds.length
      ? await this.prisma.films.findMany({
          where: {
            id: { not: filmId },
            status: film_status.visible,
            film_person_roles: {
              some: {
                person_id: { in: personIds },
              },
            },
          },
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
          orderBy: [{ popularity_score: 'desc' }, { created_at: 'desc' }],
          take: 12,
        })
      : [];

    return {
      ...this.toFilmDetailsDto(film),
      similarFilms: similarFilms.map((item) => this.toFilmListItem(item)),
      samePersonFilms: samePersonFilms.map((item) => this.toFilmListItem(item)),
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

  private async getFilmDetailsById(filmId: string) {
    return this.prisma.films.findFirst({
      where: {
        id: filmId,
        status: film_status.visible,
      },
      select: {
        id: true,
        title: true,
        original_title: true,
        description: true,
        release_year: true,
        duration_min: true,
        age_rating: true,
        average_rating: true,
        ratings_count: true,
        created_at: true,
        updated_at: true,
        film_genres: {
          select: {
            genre_id: true,
            genres: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        film_tags: {
          select: {
            tag_id: true,
            tags: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        film_countries: {
          select: {
            country_id: true,
            countries: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
        film_person_roles: {
          select: {
            person_id: true,
            role_type: true,
            character_name: true,
            billing_order: true,
            persons: {
              select: {
                id: true,
                full_name: true,
                slug: true,
              },
            },
          },
          orderBy: [{ billing_order: 'asc' }, { created_at: 'asc' }],
        },
      },
    });
  }

  private toFilmDetailsDto(
    film: Prisma.filmsGetPayload<{
      select: {
        id: true;
        title: true;
        original_title: true;
        description: true;
        release_year: true;
        duration_min: true;
        age_rating: true;
        average_rating: true;
        ratings_count: true;
        created_at: true;
        updated_at: true;
        film_genres: {
          select: {
            genre_id: true;
            genres: {
              select: {
                id: true;
                name: true;
                slug: true;
              };
            };
          };
        };
        film_tags: {
          select: {
            tag_id: true;
            tags: {
              select: {
                id: true;
                name: true;
                slug: true;
              };
            };
          };
        };
        film_countries: {
          select: {
            country_id: true;
            countries: {
              select: {
                id: true;
                code: true;
                name: true;
              };
            };
          };
        };
        film_person_roles: {
          select: {
            person_id: true;
            role_type: true;
            character_name: true;
            billing_order: true;
            persons: {
              select: {
                id: true;
                full_name: true;
                slug: true;
              };
            };
          };
        };
      };
    }>,
  ): FilmDetailsDto {
    return {
      id: film.id,
      title: film.title,
      originalTitle: film.original_title,
      description: film.description,
      releaseYear: film.release_year,
      durationMin: film.duration_min,
      ageRating: film.age_rating,
      averageRating: Number(film.average_rating),
      ratingsCount: film.ratings_count,
      genres: film.film_genres.map((item) => ({
        id: item.genres.id,
        name: item.genres.name,
        slug: item.genres.slug,
      })),
      tags: film.film_tags.map((item) => ({
        id: item.tags.id,
        name: item.tags.name,
        slug: item.tags.slug,
      })),
      countries: film.film_countries.map((item) => ({
        id: item.countries.id,
        code: item.countries.code,
        name: item.countries.name,
      })),
      persons: film.film_person_roles.map((item) => ({
        personId: item.persons.id,
        fullName: item.persons.full_name,
        slug: item.persons.slug,
        roleType: item.role_type,
        characterName: item.character_name,
        billingOrder: item.billing_order,
      })),
      createdAt: film.created_at,
      updatedAt: film.updated_at,
    };
  }
}
