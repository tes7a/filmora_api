import { Injectable } from '@nestjs/common';
import { comment_status, film_status, Prisma } from '@prisma/client';

import { PrismaService } from '@/shared';

import type {
  CommentDto,
  CommentTreeDto,
  CreatedFilmReviewDto,
  CreateFilmReviewParams,
  CreateReviewCommentParams,
  DeleteCommentParams,
  FilmListItemDto,
  FilmRatingStatsDto,
  FilmReviewDto,
  GetFilmReviewsParams,
  GetFilmsParams,
  GetMyFilmRatingParams,
  GetReviewCommentsParams,
  MyFilmRatingDto,
  UpdateCommentParams,
  UpdatedReviewDto,
  UpdateFilmRatingParams,
  UpdateReviewParams,
} from '../dto';
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

  async getFilmReviews(params: GetFilmReviewsParams): Promise<FilmReviewDto[] | null> {
    const { filmId } = params;

    const film = await this.prisma.films.findUnique({
      where: { id: filmId },
      select: { id: true },
    });

    if (!film) {
      return null;
    }

    const reviews = await this.prisma.reviews.findMany({
      where: {
        film_id: filmId,
      },
      select: {
        id: true,
        status: true,
        created_at: true,
        users: {
          select: {
            id: true,
            display_name: true,
          },
        },
        review_versions_reviews_current_version_idToreview_versions: {
          select: {
            id: true,
            version_number: true,
            title: true,
            body: true,
            created_at: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return reviews.map((review) => ({
      reviewId: review.id,
      status: review.status,
      createdAt: review.created_at,
      user: {
        id: review.users.id,
        displayName: review.users.display_name,
      },
      currentVersion:
        review.review_versions_reviews_current_version_idToreview_versions
          ? {
              id: review.review_versions_reviews_current_version_idToreview_versions.id,
              versionNumber:
                review.review_versions_reviews_current_version_idToreview_versions
                  .version_number,
              title:
                review.review_versions_reviews_current_version_idToreview_versions
                  .title,
              body: review.review_versions_reviews_current_version_idToreview_versions.body,
              createdAt:
                review.review_versions_reviews_current_version_idToreview_versions
                  .created_at,
            }
          : null,
    }));
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

  async createFilmReview(
    params: CreateFilmReviewParams,
  ): Promise<CreatedFilmReviewDto | null> {
    const { filmId, userId, title, body } = params;

    try {
      return this.prisma.$transaction(async (tx) => {
        const film = await tx.films.findUnique({
          where: { id: filmId },
          select: { id: true },
        });

        if (!film) {
          return null;
        }

        const review = await tx.reviews.create({
          data: {
            film_id: filmId,
            user_id: userId,
          },
          select: {
            id: true,
            created_at: true,
            updated_at: true,
          },
        });

        const initialVersion = await tx.review_versions.create({
          data: {
            review_id: review.id,
            version_number: 1,
            title,
            body,
            edited_by_user_id: userId,
          },
          select: {
            id: true,
          },
        });

        const updatedReview = await tx.reviews.update({
          where: { id: review.id },
          data: {
            current_version_id: initialVersion.id,
            updated_at: new Date(),
          },
          select: {
            updated_at: true,
          },
        });

        return {
          reviewId: review.id,
          filmId,
          userId,
          currentVersionId: initialVersion.id,
          versionNumber: 1,
          title,
          body,
          createdAt: review.created_at,
          updatedAt: updatedReview.updated_at,
        };
      });
    } catch (error) {
      const prismaError = error as { code?: string } | undefined;

      if (prismaError?.code === 'P2002') {
        throw new Error('REVIEW_ALREADY_EXISTS');
      }

      throw error;
    }
  }

  async updateReview(params: UpdateReviewParams): Promise<UpdatedReviewDto | null> {
    const { filmId, userId, title, body } = params;

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.reviews.findFirst({
        where: {
          film_id: filmId,
          user_id: userId,
        },
        select: {
          id: true,
          status: true,
          created_at: true,
        },
      });

      if (!review) {
        return null;
      }

      const versionAggregate = await tx.review_versions.aggregate({
        where: { review_id: review.id },
        _max: { version_number: true },
      });

      const nextVersionNumber = (versionAggregate._max.version_number ?? 0) + 1;

      const version = await tx.review_versions.create({
        data: {
          review_id: review.id,
          version_number: nextVersionNumber,
          title,
          body,
          edited_by_user_id: userId,
        },
        select: {
          id: true,
          version_number: true,
          title: true,
          body: true,
          created_at: true,
        },
      });

      const updatedReview = await tx.reviews.update({
        where: { id: review.id },
        data: {
          current_version_id: version.id,
          updated_at: new Date(),
        },
        select: {
          id: true,
          status: true,
          created_at: true,
          updated_at: true,
        },
      });

      return {
        reviewId: updatedReview.id,
        status: updatedReview.status,
        createdAt: updatedReview.created_at,
        updatedAt: updatedReview.updated_at,
        currentVersion: {
          id: version.id,
          versionNumber: version.version_number,
          title: version.title,
          body: version.body,
          createdAt: version.created_at,
        },
      };
    });
  }

  async createReviewComment(
    params: CreateReviewCommentParams,
  ): Promise<CommentDto | null> {
    const { reviewId, userId, body, parentId } = params;

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.reviews.findUnique({
        where: { id: reviewId },
        select: { id: true },
      });

      if (!review) {
        return null;
      }

      if (parentId) {
        const parent = await tx.comments.findUnique({
          where: { id: parentId },
          select: {
            id: true,
            review_id: true,
          },
        });

        if (!parent) {
          throw new Error('PARENT_COMMENT_NOT_FOUND');
        }

        if (parent.review_id !== reviewId) {
          throw new Error('PARENT_COMMENT_WRONG_REVIEW');
        }
      }

      const comment = await tx.comments.create({
        data: {
          review_id: reviewId,
          user_id: userId,
          parent_id: parentId ?? null,
          body,
          status: comment_status.visible,
        },
        select: {
          id: true,
          review_id: true,
          user_id: true,
          parent_id: true,
          body: true,
          status: true,
          created_at: true,
          updated_at: true,
          users: {
            select: {
              id: true,
              display_name: true,
            },
          },
        },
      });

      return {
        commentId: comment.id,
        reviewId: comment.review_id,
        userId: comment.user_id,
        parentId: comment.parent_id,
        body: comment.body,
        status: comment.status,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        user: {
          id: comment.users.id,
          displayName: comment.users.display_name,
        },
      };
    });
  }

  async getReviewComments(
    params: GetReviewCommentsParams,
  ): Promise<CommentTreeDto[] | null> {
    const { reviewId } = params;

    const review = await this.prisma.reviews.findUnique({
      where: { id: reviewId },
      select: { id: true },
    });

    if (!review) {
      return null;
    }

    const comments = await this.prisma.comments.findMany({
      where: {
        review_id: reviewId,
        status: comment_status.visible,
      },
      select: {
        id: true,
        review_id: true,
        user_id: true,
        parent_id: true,
        body: true,
        status: true,
        created_at: true,
        updated_at: true,
        users: {
          select: {
            id: true,
            display_name: true,
          },
        },
      },
      orderBy: [{ created_at: 'asc' }, { id: 'asc' }],
    });

    const nodeById = new Map<string, CommentTreeDto>();
    const roots: CommentTreeDto[] = [];

    for (const comment of comments) {
      nodeById.set(comment.id, {
        commentId: comment.id,
        reviewId: comment.review_id,
        userId: comment.user_id,
        parentId: comment.parent_id,
        body: comment.body,
        status: comment.status,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        user: {
          id: comment.users.id,
          displayName: comment.users.display_name,
        },
        children: [],
      });
    }

    for (const comment of comments) {
      const node = nodeById.get(comment.id);

      if (!node) {
        continue;
      }

      if (comment.parent_id) {
        const parentNode = nodeById.get(comment.parent_id);

        if (parentNode) {
          parentNode.children.push(node);
          continue;
        }
      }

      roots.push(node);
    }

    return roots;
  }

  async updateComment(params: UpdateCommentParams): Promise<CommentDto | null> {
    const { commentId, userId, body } = params;

    const existingComment = await this.prisma.comments.findFirst({
      where: {
        id: commentId,
        user_id: userId,
        status: {
          not: comment_status.deleted,
        },
      },
      select: { id: true },
    });

    if (!existingComment) {
      return null;
    }

    const updatedComment = await this.prisma.comments.update({
      where: { id: commentId },
      data: {
        body,
        updated_at: new Date(),
      },
      select: {
        id: true,
        review_id: true,
        user_id: true,
        parent_id: true,
        body: true,
        status: true,
        created_at: true,
        updated_at: true,
        users: {
          select: {
            id: true,
            display_name: true,
          },
        },
      },
    });

    return {
      commentId: updatedComment.id,
      reviewId: updatedComment.review_id,
      userId: updatedComment.user_id,
      parentId: updatedComment.parent_id,
      body: updatedComment.body,
      status: updatedComment.status,
      createdAt: updatedComment.created_at,
      updatedAt: updatedComment.updated_at,
      user: {
        id: updatedComment.users.id,
        displayName: updatedComment.users.display_name,
      },
    };
  }

  async deleteComment(params: DeleteCommentParams): Promise<CommentDto | null> {
    const { commentId, userId } = params;

    const existingComment = await this.prisma.comments.findFirst({
      where: {
        id: commentId,
        user_id: userId,
        status: {
          not: comment_status.deleted,
        },
      },
      select: { id: true },
    });

    if (!existingComment) {
      return null;
    }

    const deletedComment = await this.prisma.comments.update({
      where: { id: commentId },
      data: {
        status: comment_status.deleted,
        updated_at: new Date(),
      },
      select: {
        id: true,
        review_id: true,
        user_id: true,
        parent_id: true,
        body: true,
        status: true,
        created_at: true,
        updated_at: true,
        users: {
          select: {
            id: true,
            display_name: true,
          },
        },
      },
    });

    return {
      commentId: deletedComment.id,
      reviewId: deletedComment.review_id,
      userId: deletedComment.user_id,
      parentId: deletedComment.parent_id,
      body: deletedComment.body,
      status: deletedComment.status,
      createdAt: deletedComment.created_at,
      updatedAt: deletedComment.updated_at,
      user: {
        id: deletedComment.users.id,
        displayName: deletedComment.users.display_name,
      },
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
