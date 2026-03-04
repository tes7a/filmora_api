import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ROUTES } from '@/utils';

import {
  GetNewRecommendationsService,
  GetPopularRecommendationsService,
} from '../../application';
import {
  GetRecommendationsQueryDto,
  PaginatedRecommendationsResponseDto,
} from '../dto';

@Controller(ROUTES.RECOMMENDATIONS)
@ApiTags('Recommendations')
export class RecommendationsController {
  constructor(
    private readonly getPopularRecommendationsService: GetPopularRecommendationsService,
    private readonly getNewRecommendationsService: GetNewRecommendationsService,
  ) {}

  @Get(ROUTES.RECOMMENDATIONS_POPULAR)
  @ApiOperation({ summary: 'Get popular recommendations by rating and ratings count' })
  @ApiOkResponse({ type: PaginatedRecommendationsResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error for query params' })
  async getPopular(@Query() query: GetRecommendationsQueryDto) {
    return this.getPopularRecommendationsService.execute({
      q: query.q,
      genreIds: query.genreIds,
      tagIds: query.tagIds,
      countryIds: query.countryIds,
      yearFrom: query.yearFrom,
      yearTo: query.yearTo,
      ratingFrom: query.ratingFrom,
      ratingTo: query.ratingTo,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  @Get(ROUTES.RECOMMENDATIONS_NEW)
  @ApiOperation({ summary: 'Get new recommendations by release and added date' })
  @ApiOkResponse({ type: PaginatedRecommendationsResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error for query params' })
  async getNew(@Query() query: GetRecommendationsQueryDto) {
    return this.getNewRecommendationsService.execute({
      q: query.q,
      genreIds: query.genreIds,
      tagIds: query.tagIds,
      countryIds: query.countryIds,
      yearFrom: query.yearFrom,
      yearTo: query.yearTo,
      ratingFrom: query.ratingFrom,
      ratingTo: query.ratingTo,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page: query.page,
      pageSize: query.pageSize,
    });
  }
}
