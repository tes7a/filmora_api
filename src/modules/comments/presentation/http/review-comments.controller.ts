import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';

import type { AuthenticatedUser } from '@/modules/auth/infrastructure';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '@/modules/auth/presentation';
import { ROUTES } from '@/utils';

import {
  CreateReviewCommentService,
  GetReviewCommentsService,
} from '../../application';
import {
  CommentResponseDto,
  CommentTreeResponseDto,
  CreateReviewCommentDto,
} from '../dto';

@Controller(ROUTES.REVIEWS)
@ApiTags('Comments')
export class ReviewCommentsController {
  constructor(
    private readonly createReviewCommentService: CreateReviewCommentService,
    private readonly getReviewCommentsService: GetReviewCommentsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post(ROUTES.REVIEW_COMMENTS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create comment for review' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Review id',
  })
  @ApiBody({ type: CreateReviewCommentDto })
  @ApiOkResponse({ type: CommentResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Review or parent comment not found' })
  async createReviewComment(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) reviewId: string,
    @Body() body: CreateReviewCommentDto,
  ) {
    const user = req.user as AuthenticatedUser;

    return this.createReviewCommentService.execute({
      reviewId,
      userId: user.id,
      body: body.body,
      parentId: body.parentId ?? null,
    });
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(ROUTES.REVIEW_COMMENTS)
  @ApiOperation({
    summary: 'Get visible comments tree for review ordered by created_at',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Review id',
  })
  @ApiOkResponse({ type: CommentTreeResponseDto, isArray: true })
  @ApiNotFoundResponse({ description: 'Review not found' })
  async getReviewComments(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) reviewId: string,
  ) {
    const user = req.user as AuthenticatedUser | undefined;

    return this.getReviewCommentsService.execute({
      reviewId,
      requesterUserId: user?.id,
    });
  }
}
