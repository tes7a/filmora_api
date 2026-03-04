import { Injectable } from '@nestjs/common';
import { film_status, Prisma } from '@prisma/client';

import { PrismaService } from '@/shared';

import type {
  GetRecommendationsParams,
  PaginatedRecommendationsDto,
  RecommendationItemDto,
  RecommendationSortBy,
} from '../dto';
import type { RecommendationsRepository } from './recommendations.repository';

type RecommendationEntity = {
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

@Injectable()
export class PrismaRecommendationsRepository implements RecommendationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getPopularRecommendations(
    params: GetRecommendationsParams,
  ): Promise<PaginatedRecommendationsDto> {
    return this.getRecommendationsWithPaging(params, 'rating');
  }

  async getNewRecommendations(
    params: GetRecommendationsParams,
  ): Promise<PaginatedRecommendationsDto> {
    return this.getRecommendationsWithPaging(params, 'date');
  }

  private toRecommendationItem(film: RecommendationEntity): RecommendationItemDto {
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

  private async getRecommendationsWithPaging(
    params: GetRecommendationsParams,
    defaultSortBy: RecommendationSortBy,
  ): Promise<PaginatedRecommendationsDto> {
    const { page, pageSize } = params;
    const skip = (page - 1) * pageSize;
    const where = this.buildWhere(params);
    const orderBy = this.buildOrderBy(params, defaultSortBy);

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
      items: films.map((film) => this.toRecommendationItem(film)),
      total,
      page,
      pageSize,
    };
  }

  private buildWhere(params: GetRecommendationsParams): Prisma.filmsWhereInput {
    const {
      q,
      genreIds,
      tagIds,
      countryIds,
      yearFrom,
      yearTo,
      ratingFrom,
      ratingTo,
    } = params;

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

    return {
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
        ? { release_year: releaseYearFilter }
        : {}),
      ...(Object.keys(averageRatingFilter).length
        ? { average_rating: averageRatingFilter }
        : {}),
    };
  }

  private buildOrderBy(
    params: GetRecommendationsParams,
    defaultSortBy: RecommendationSortBy,
  ): Prisma.filmsOrderByWithRelationInput[] {
    const sortBy = params.sortBy ?? defaultSortBy;
    const sortOrder = params.sortOrder;
    const orderBy: Prisma.filmsOrderByWithRelationInput[] = [];

    if (sortBy === 'rating') {
      orderBy.push({ average_rating: sortOrder }, { ratings_count: 'desc' });
    } else if (sortBy === 'popularity') {
      orderBy.push({ popularity_score: sortOrder });
    } else {
      orderBy.push({ release_year: sortOrder }, { created_at: sortOrder });
    }

    orderBy.push({ created_at: 'desc' });

    return orderBy;
  }
}
