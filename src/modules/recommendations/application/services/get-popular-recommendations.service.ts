import { Inject, Injectable } from '@nestjs/common';

import {
  type GetRecommendationsParams,
  type PaginatedRecommendationsDto,
  RECOMMENDATIONS_REPOSITORY,
  type RecommendationsRepository,
} from '../../infrastructure';

@Injectable()
export class GetPopularRecommendationsService {
  constructor(
    @Inject(RECOMMENDATIONS_REPOSITORY)
    private readonly recommendationsRepository: RecommendationsRepository,
  ) {}

  async execute(
    params: GetRecommendationsParams,
  ): Promise<PaginatedRecommendationsDto> {
    return this.recommendationsRepository.getPopularRecommendations(params);
  }
}
