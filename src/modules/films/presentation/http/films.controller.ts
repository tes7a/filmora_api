import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { ROUTES } from '@/utils';

import { GetFilmsService } from '../../application';
import { PaginatedFilmsResponseDto } from '../dto';
import { GetFilmsQueryDto } from '../dto/get-films.query';

@Controller(ROUTES.FILMS)
@ApiTags('Films')
export class FilmsController {
  constructor(private readonly getFilmsService: GetFilmsService) {}

  @Get()
  @ApiOperation({
    summary:
      'Get films with search, filtering by genres/years, sorting, and pagination',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by title (contains, case-insensitive)',
    example: 'matrix',
  })
  @ApiQuery({
    name: 'genres',
    required: false,
    type: String,
    description:
      'Genre slugs as CSV or repeated params. Example: genres=sci-fi,action',
    example: 'sci-fi,drama',
  })
  @ApiQuery({
    name: 'years',
    required: false,
    type: String,
    description: 'Release years as CSV or repeated params. Example: years=1999,2003',
    example: '1999,2003',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['rating', 'newest'],
    description: 'Sort mode',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort direction',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiOkResponse({ type: PaginatedFilmsResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error for query params' })
  async getFilms(@Query() query: GetFilmsQueryDto) {
    return this.getFilmsService.execute({
      search: query.search,
      genres: query.genres,
      years: query.years,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page: query.page,
      limit: query.limit,
    });
  }
}
