import { Module } from '@nestjs/common';

import {
  CreateReviewCommentService,
  DeleteCommentService,
  GetReviewCommentsService,
  UpdateCommentService,
} from './application';
import { COMMENTS_REPOSITORY, PrismaCommentsRepository } from './infrastructure';
import { CommentsController, ReviewCommentsController } from './presentation';

@Module({
  controllers: [ReviewCommentsController, CommentsController],
  providers: [
    CreateReviewCommentService,
    DeleteCommentService,
    GetReviewCommentsService,
    UpdateCommentService,
    {
      provide: COMMENTS_REPOSITORY,
      useClass: PrismaCommentsRepository,
    },
  ],
  exports: [],
})
export class CommentsModule {}
