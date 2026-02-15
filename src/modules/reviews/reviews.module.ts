import { Module } from '@nestjs/common';

import {
  CreateFilmReviewService,
  GetFilmReviewsService,
  UpdateReviewService,
} from './application';
import { PrismaReviewsRepository, REVIEWS_REPOSITORY } from './infrastructure';
import { ReviewsController } from './presentation';

@Module({
  controllers: [ReviewsController],
  providers: [
    CreateFilmReviewService,
    GetFilmReviewsService,
    UpdateReviewService,
    {
      provide: REVIEWS_REPOSITORY,
      useClass: PrismaReviewsRepository,
    },
  ],
  exports: [],
})
export class ReviewsModule {}
