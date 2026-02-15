import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/shared';

import type {
  CreatedFilmReviewDto,
  CreateFilmReviewParams,
  FilmReviewDto,
  GetFilmReviewsParams,
  UpdatedReviewDto,
  UpdateReviewParams,
} from '../dto';
import type { ReviewsRepository } from './reviews.repository';

@Injectable()
export class PrismaReviewsRepository implements ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

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
              body:
                review.review_versions_reviews_current_version_idToreview_versions.body,
              createdAt:
                review.review_versions_reviews_current_version_idToreview_versions
                  .created_at,
            }
          : null,
    }));
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
}
