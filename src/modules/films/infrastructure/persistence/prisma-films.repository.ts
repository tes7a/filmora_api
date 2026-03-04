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
  GetSimilarFilmsParams,
  MyFilmRatingDto,
  PaginatedSimilarFilmsDto,
  SimilarFilmDto,
  UpdateFilmRatingParams,
} from '../dto';
import type { FilmsRepository } from './films.repository';

type FilmListEntity = {
  id: string;
  title: string;
  original_title: string;
  release_year: number;
  duration_min: number;
  age_rating: string | null;
  average_rating: Prisma.Decimal;
  ratings_count: number;
  created_at: Date;
  film_genres: Array<{
    genres: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
};

type FilmDetailsEntity = {
  id: string;
  title: string;
  original_title: string;
  description: string | null;
  release_year: number;
  duration_min: number;
  age_rating: string | null;
  average_rating: Prisma.Decimal;
  ratings_count: number;
  created_at: Date;
  updated_at: Date;
  film_genres: Array<{
    genre_id: string;
    genres: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  film_tags: Array<{
    tag_id: string;
    tags: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  film_countries: Array<{
    country_id: string;
    countries: {
      id: string;
      code: string;
      name: string;
    };
  }>;
  film_person_roles: Array<{
    person_id: string;
    role_type: string;
    character_name: string | null;
    billing_order: number | null;
    persons: {
      id: string;
      full_name: string;
      slug: string;
    };
  }>;
};

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

  async getSimilarFilms(
    filmId: string,
    params: GetSimilarFilmsParams,
  ): Promise<PaginatedSimilarFilmsDto | null> {
    const film = await this.getFilmDetailsById(filmId);

    if (!film) {
      return null;
    }

    const {
      q,
      genreIds: filterGenreIds,
      tagIds: filterTagIds,
      countryIds,
      yearFrom,
      yearTo,
      ratingFrom,
      ratingTo,
      sortBy = 'similarity',
      sortOrder,
      page,
      pageSize,
    } = params;

    const genreIds = new Set(film.film_genres.map((item) => item.genre_id));
    const tagIds = new Set(film.film_tags.map((item) => item.tag_id));
    const personIds = new Set(film.film_person_roles.map((item) => item.person_id));

    const baseGenres = new Map(film.film_genres.map((item) => [item.genre_id, item.genres.name]));
    const baseTags = new Map(film.film_tags.map((item) => [item.tag_id, item.tags.name]));
    const basePersons = new Map(
      film.film_person_roles.map((item) => [item.person_id, item.persons.full_name]),
    );

    if (!genreIds.size && !tagIds.size && !personIds.size) {
      return {
        items: [],
        total: 0,
        page,
        pageSize,
      };
    }

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

    const candidates = await this.prisma.films.findMany({
      where: {
        id: { not: filmId },
        status: film_status.visible,
        ...(q
          ? {
              title: {
                contains: q,
                mode: Prisma.QueryMode.insensitive,
              },
            }
          : {}),
        ...(filterGenreIds?.length
          ? {
              film_genres: {
                some: {
                  genre_id: { in: filterGenreIds },
                },
              },
            }
          : {}),
        ...(filterTagIds?.length
          ? {
              film_tags: {
                some: {
                  tag_id: { in: filterTagIds },
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
        OR: [
          ...(genreIds.size
            ? [
                {
                  film_genres: {
                    some: {
                      genre_id: { in: [...genreIds] },
                    },
                  },
                },
              ]
            : []),
          ...(tagIds.size
            ? [
                {
                  film_tags: {
                    some: {
                      tag_id: { in: [...tagIds] },
                    },
                  },
                },
              ]
            : []),
          ...(personIds.size
            ? [
                {
                  film_person_roles: {
                    some: {
                      person_id: { in: [...personIds] },
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
        popularity_score: true,
        created_at: true,
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
          },
        },
        film_person_roles: {
          select: {
            person_id: true,
          },
        },
      },
    });

    const scored = candidates
      .map((candidate) => {
        const sharedGenreNames = [
          ...new Set(
            candidate.film_genres
              .filter((item) => genreIds.has(item.genre_id))
              .map((item) => baseGenres.get(item.genre_id))
              .filter((name): name is string => Boolean(name)),
          ),
        ];

        const sharedTagNames = [
          ...new Set(
            candidate.film_tags
              .filter((item) => tagIds.has(item.tag_id))
              .map((item) => baseTags.get(item.tag_id))
              .filter((name): name is string => Boolean(name)),
          ),
        ];

        const sharedPersonNames = [
          ...new Set(
            candidate.film_person_roles
              .filter((item) => personIds.has(item.person_id))
              .map((item) => basePersons.get(item.person_id))
              .filter((name): name is string => Boolean(name)),
          ),
        ];

        const reasonParts: string[] = [];
        if (sharedGenreNames.length) {
          reasonParts.push(`Shared genres: ${sharedGenreNames.join(', ')}`);
        }
        if (sharedTagNames.length) {
          reasonParts.push(`Shared tags: ${sharedTagNames.join(', ')}`);
        }
        if (sharedPersonNames.length) {
          reasonParts.push(`Shared persons: ${sharedPersonNames.join(', ')}`);
        }

        const score =
          sharedGenreNames.length * 3 +
          sharedTagNames.length * 2 +
          sharedPersonNames.length * 4;

        return {
          candidate,
          similar: {
            film: this.toFilmListItem({
              ...candidate,
              film_genres: candidate.film_genres.map((item) => ({
                genres: item.genres,
              })),
            }),
            reason: reasonParts.join('; '),
          } satisfies SimilarFilmDto,
          score,
        };
      })
      .filter((item) => item.score > 0);

    const direction = sortOrder === 'asc' ? 1 : -1;

    scored.sort((a, b) => {
      const bySimilarity = (b.score - a.score) * direction;
      const byRating =
        (Number(b.candidate.average_rating) - Number(a.candidate.average_rating)) * direction;
      const byDate = (b.candidate.release_year - a.candidate.release_year) * direction;
      const byPopularity =
        (Number(b.candidate.popularity_score) - Number(a.candidate.popularity_score)) * direction;
      const byCount = (b.candidate.ratings_count - a.candidate.ratings_count) * direction;

      if (sortBy === 'rating') {
        return byRating || byCount || bySimilarity;
      }

      if (sortBy === 'date') {
        return byDate || bySimilarity || byRating;
      }

      if (sortBy === 'popularity') {
        return byPopularity || bySimilarity || byRating;
      }

      return bySimilarity || byRating || byCount;
    });

    const total = scored.length;
    const start = (page - 1) * pageSize;
    const items = scored.slice(start, start + pageSize).map((item) => item.similar);

    return {
      items,
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

  private async getFilmDetailsById(filmId: string): Promise<FilmDetailsEntity | null> {
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

  private toFilmListItem(film: FilmListEntity): FilmListItemDto {
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

  private toFilmDetailsDto(film: FilmDetailsEntity): FilmDetailsDto {
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
