import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';

import type { AuthenticatedUser } from '@/modules/auth/infrastructure';
import { JwtAuthGuard } from '@/modules/auth/presentation';
import { ROUTES } from '@/utils';

import {
  CreateFilmReviewService,
  GetFilmReviewsService,
  UpdateReviewService,
} from '../../application';
import {
  CreatedFilmReviewResponseDto,
  CreateFilmReviewDto,
  FilmReviewResponseDto,
  UpdatedReviewResponseDto,
  UpdateReviewDto,
} from '../dto';

@Controller(ROUTES.REVIEWS)
@ApiTags('Reviews')
export class ReviewsController {
  constructor(
    private readonly createFilmReviewService: CreateFilmReviewService,
    private readonly getFilmReviewsService: GetFilmReviewsService,
    private readonly updateReviewService: UpdateReviewService,
  ) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get film reviews with current version and user',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Film id',
  })
  @ApiOkResponse({ type: FilmReviewResponseDto, isArray: true })
  @ApiNotFoundResponse({ description: 'Film not found' })
  async getFilmReviews(@Param('id', new ParseUUIDPipe()) filmId: string) {
    return this.getFilmReviewsService.execute({
      filmId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create review for current user and film',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Film id',
  })
  @ApiBody({ type: CreateFilmReviewDto })
  @ApiOkResponse({ type: CreatedFilmReviewResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Film not found' })
  @ApiConflictResponse({
    description: 'User already has a review for this film',
  })
  async createFilmReview(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) filmId: string,
    @Body() body: CreateFilmReviewDto,
  ) {
    const user = req.user as AuthenticatedUser;

    return this.createFilmReviewService.execute({
      filmId,
      userId: user.id,
      title: body.title,
      body: body.body,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Edit own review for the film',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Film id',
  })
  @ApiBody({ type: UpdateReviewDto })
  @ApiOkResponse({ type: UpdatedReviewResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Review not found' })
  async updateReview(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) filmId: string,
    @Body() body: UpdateReviewDto,
  ) {
    const user = req.user as AuthenticatedUser;

    return this.updateReviewService.execute({
      filmId,
      userId: user.id,
      title: body.title,
      body: body.body,
    });
  }
}
