import type { GetRecommendationsParams, PaginatedRecommendationsDto } from '../dto';

export type { GetRecommendationsParams, PaginatedRecommendationsDto } from '../dto';

export const RECOMMENDATIONS_REPOSITORY = Symbol('RECOMMENDATIONS_REPOSITORY');

export interface RecommendationsRepository {
  getPopularRecommendations(
    params: GetRecommendationsParams,
  ): Promise<PaginatedRecommendationsDto>;
  getNewRecommendations(
    params: GetRecommendationsParams,
  ): Promise<PaginatedRecommendationsDto>;
}
