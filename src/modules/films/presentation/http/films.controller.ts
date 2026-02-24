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
  GetFilmByIdService,
  GetFilmFullByIdService,
  GetFilmsService,
  GetMyFilmRatingService,
  UpdateFilmRatingService,
} from '../../application';
import {
  FilmDetailsResponseDto,
  FilmFullResponseDto,
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
    private readonly getFilmByIdService: GetFilmByIdService,
    private readonly getFilmFullByIdService: GetFilmFullByIdService,
    private readonly getFilmsService: GetFilmsService,
    private readonly getMyFilmRatingService: GetMyFilmRatingService,
    private readonly updateFilmRatingService: UpdateFilmRatingService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Get films with filtering, sorting, and pagination',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    type: String,
    description: 'Search by title (contains, case-insensitive)',
    example: 'matrix',
  })
  @ApiQuery({
    name: 'genreIds',
    required: false,
    type: String,
    description: 'Genre ids as CSV or repeated params',
    example:
      '0d1f4667-e9c8-4ac6-9d11-682de1f06b52,9ba189b7-a337-4edf-aa1f-70e41c003337',
  })
  @ApiQuery({
    name: 'tagIds',
    required: false,
    type: String,
    description: 'Tag ids as CSV or repeated params',
    example:
      '12474e2e-2936-4a1d-a885-5fe1a74f4529,25664376-3e6c-40f7-bfb7-af10bacd1a2d',
  })
  @ApiQuery({
    name: 'countryIds',
    required: false,
    type: String,
    description: 'Country ids as CSV or repeated params',
    example:
      'bfb6fd98-bf97-4996-b8e5-e08ce59477cf,f272ea98-4b54-4f6a-b752-b97456943f43',
  })
  @ApiQuery({
    name: 'yearFrom',
    required: false,
    type: Number,
    example: 1990,
  })
  @ApiQuery({
    name: 'yearTo',
    required: false,
    type: Number,
    example: 2025,
  })
  @ApiQuery({
    name: 'ratingFrom',
    required: false,
    type: Number,
    example: 7.5,
  })
  @ApiQuery({
    name: 'ratingTo',
    required: false,
    type: Number,
    example: 9.5,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['rating', 'date', 'popularity'],
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
    name: 'pageSize',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiOkResponse({ type: PaginatedFilmsResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error for query params' })
  async getFilms(@Query() query: GetFilmsQueryDto) {
    return this.getFilmsService.execute({
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

  @Get(':id')
  @ApiOperation({
    summary: 'Get film details by id',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Film id',
  })
  @ApiOkResponse({ type: FilmDetailsResponseDto })
  @ApiNotFoundResponse({ description: 'Film not found' })
  async getFilmById(@Param('id', new ParseUUIDPipe()) filmId: string) {
    return this.getFilmByIdService.execute(filmId);
  }

  @Get(':id/full')
  @ApiOperation({
    summary: 'Get full film details with similar and related-person films',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Film id',
  })
  @ApiOkResponse({ type: FilmFullResponseDto })
  @ApiNotFoundResponse({ description: 'Film not found' })
  async getFilmFullById(@Param('id', new ParseUUIDPipe()) filmId: string) {
    return this.getFilmFullByIdService.execute(filmId);
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
