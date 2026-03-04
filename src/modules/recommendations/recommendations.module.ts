import { Module } from '@nestjs/common';

import {
  GetNewRecommendationsService,
  GetPopularRecommendationsService,
} from './application';
import {
  PrismaRecommendationsRepository,
  RECOMMENDATIONS_REPOSITORY,
} from './infrastructure';
import { RecommendationsController } from './presentation';

@Module({
  controllers: [RecommendationsController],
  providers: [
    GetPopularRecommendationsService,
    GetNewRecommendationsService,
    {
      provide: RECOMMENDATIONS_REPOSITORY,
      useClass: PrismaRecommendationsRepository,
    },
  ],
  exports: [],
})
export class RecommendationsModule {}
