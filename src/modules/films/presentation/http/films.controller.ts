import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';

import type { AuthenticatedUser } from '@/modules/auth/infrastructure';
import { JwtAuthGuard } from '@/modules/auth/presentation';
import { ROUTES } from '@/utils';

import {
  GetFilmsService,
  GetMyFilmRatingService,
  UpdateFilmRatingService,
} from '../../application';
import {
  MyFilmRatingResponseDto,
  PaginatedFilmsResponseDto,
  UpdateFilmRatingDto,
  UpdateFilmRatingResponseDto,
} from '../dto';
import { GetFilmsQueryDto } from '../dto/get-films.query';

@Controller(ROUTES.FILMS)
@ApiTags('Films')
export class FilmsController {
  constructor(
    private readonly getFilmsService: GetFilmsService,
    private readonly getMyFilmRatingService: GetMyFilmRatingService,
    private readonly updateFilmRatingService: UpdateFilmRatingService,
  ) {}

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
    description:
      'Release years as CSV or repeated params. Example: years=1999,2003',
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

  @UseGuards(JwtAuthGuard)
  @Put(ROUTES.FILM_UPDATE_RATING)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create or update current user rating for a film',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Film id',
  })
  @ApiBody({ type: UpdateFilmRatingDto })
  @ApiOkResponse({ type: UpdateFilmRatingResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Film not found' })
  async updateFilmRating(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) filmId: string,
    @Body() body: UpdateFilmRatingDto,
  ) {
    const user = req.user as AuthenticatedUser;

    return this.updateFilmRatingService.execute({
      filmId,
      userId: user.id,
      score: body.score,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(ROUTES.FILM_GET_MY_RATING)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user rating for a film',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Film id',
  })
  @ApiOkResponse({ type: MyFilmRatingResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Film not found' })
  async getMyFilmRating(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) filmId: string,
  ) {
    const user = req.user as AuthenticatedUser;

    return this.getMyFilmRatingService.execute({
      filmId,
      userId: user.id,
    });
  }
}
