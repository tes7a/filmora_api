import { Module } from '@nestjs/common';

import {
  CreateFilmReviewService,
  CreateReviewCommentService,
  DeleteCommentService,
  GetFilmReviewsService,
  GetFilmsService,
  GetMyFilmRatingService,
  GetReviewCommentsService,
  UpdateCommentService,
  UpdateFilmRatingService,
  UpdateReviewService,
} from './application';
import { FILMS_REPOSITORY, PrismaFilmsRepository } from './infrastructure';
import {
  CommentsController,
  FilmsController,
  ReviewsCommentsController,
} from './presentation';

@Module({
  controllers: [FilmsController, ReviewsCommentsController, CommentsController],
  providers: [
    CreateReviewCommentService,
    DeleteCommentService,
    CreateFilmReviewService,
    GetFilmReviewsService,
    GetFilmsService,
    GetMyFilmRatingService,
    GetReviewCommentsService,
    UpdateCommentService,
    UpdateReviewService,
    UpdateFilmRatingService,
    {
      provide: FILMS_REPOSITORY,
      useClass: PrismaFilmsRepository,
    },
  ],
  exports: [],
})
export class FilmsModule {}
