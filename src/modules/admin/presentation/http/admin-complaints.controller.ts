import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';

import type { AuthenticatedUser } from '@/modules/auth/infrastructure';
import { JwtAuthGuard, Roles, RolesGuard } from '@/modules/auth/presentation';
import { ROLES, ROUTES } from '@/utils';

import {
  BlockUserService,
  DeleteCommentService,
  DeleteReviewService,
  GetComplaintsService,
  HideCommentService,
  HideReviewService,
  UnhideCommentService,
  UnhideReviewService,
} from '../../application';
import {
  GetComplaintsQueryDto,
  ModerateTargetDto,
  ModerationActionResponseDto,
  PaginatedComplaintsResponseDto,
} from '../dto';

@Controller(ROUTES.ADMIN)
@ApiTags('Admin Complaints')
@ApiBearerAuth()
export class AdminComplaintsController {
  constructor(
    private readonly getComplaintsService: GetComplaintsService,
    private readonly hideReviewService: HideReviewService,
    private readonly unhideReviewService: UnhideReviewService,
    private readonly hideCommentService: HideCommentService,
    private readonly unhideCommentService: UnhideCommentService,
    private readonly blockUserService: BlockUserService,
    private readonly deleteReviewService: DeleteReviewService,
    private readonly deleteCommentService: DeleteCommentService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN, ROLES.MODERATOR)
  @Get(ROUTES.COMPLAINTS)
  @ApiOperation({ summary: 'Get complaints list' })
  @ApiOkResponse({ type: PaginatedComplaintsResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  async getComplaints(@Query() query: GetComplaintsQueryDto) {
    return this.getComplaintsService.execute({
      status: query.status,
      page: query.page,
      limit: query.limit,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN, ROLES.MODERATOR)
  @Post(ROUTES.ADMIN_REVIEW_HIDE)
  @ApiOperation({ summary: 'Hide review and log moderation action' })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Review id' })
  @ApiBody({ type: ModerateTargetDto })
  @ApiOkResponse({ type: ModerationActionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  @ApiNotFoundResponse({ description: 'Review not found' })
  async hideReview(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) reviewId: string,
    @Body() body: ModerateTargetDto,
  ) {
    const user = req.user as AuthenticatedUser;

    return this.hideReviewService.execute({
      targetId: reviewId,
      moderatorId: user.id,
      reason: body.reason,
      complaintId: body.complaintId,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN, ROLES.MODERATOR)
  @Post(ROUTES.ADMIN_REVIEW_UNHIDE)
  @ApiOperation({ summary: 'Unhide review and log moderation action' })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Review id' })
  @ApiBody({ type: ModerateTargetDto })
  @ApiOkResponse({ type: ModerationActionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  @ApiNotFoundResponse({ description: 'Review not found' })
  async unhideReview(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) reviewId: string,
    @Body() body: ModerateTargetDto,
  ) {
    const user = req.user as AuthenticatedUser;

    return this.unhideReviewService.execute({
      targetId: reviewId,
      moderatorId: user.id,
      reason: body.reason,
      complaintId: body.complaintId,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN, ROLES.MODERATOR)
  @Post(ROUTES.ADMIN_COMMENT_HIDE)
  @ApiOperation({ summary: 'Hide comment and log moderation action' })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Comment id' })
  @ApiBody({ type: ModerateTargetDto })
  @ApiOkResponse({ type: ModerationActionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  async hideComment(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) commentId: string,
    @Body() body: ModerateTargetDto,
  ) {
    const user = req.user as AuthenticatedUser;

    return this.hideCommentService.execute({
      targetId: commentId,
      moderatorId: user.id,
      reason: body.reason,
      complaintId: body.complaintId,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN, ROLES.MODERATOR)
  @Post(ROUTES.ADMIN_COMMENT_UNHIDE)
  @ApiOperation({ summary: 'Unhide comment and log moderation action' })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Comment id' })
  @ApiBody({ type: ModerateTargetDto })
  @ApiOkResponse({ type: ModerationActionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  async unhideComment(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) commentId: string,
    @Body() body: ModerateTargetDto,
  ) {
    const user = req.user as AuthenticatedUser;

    return this.unhideCommentService.execute({
      targetId: commentId,
      moderatorId: user.id,
      reason: body.reason,
      complaintId: body.complaintId,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN, ROLES.MODERATOR)
  @Post(ROUTES.ADMIN_USER_BLOCK)
  @ApiOperation({ summary: 'Block user and log moderation action' })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'User id' })
  @ApiBody({ type: ModerateTargetDto })
  @ApiOkResponse({ type: ModerationActionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async blockUser(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) userId: string,
    @Body() body: ModerateTargetDto,
  ) {
    const user = req.user as AuthenticatedUser;

    return this.blockUserService.execute({
      userId,
      moderatorId: user.id,
      reason: body.reason,
      complaintId: body.complaintId,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN, ROLES.MODERATOR)
  @Post(ROUTES.ADMIN_REVIEW_DELETE)
  @ApiOperation({ summary: 'Delete review and log moderation action' })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Review id' })
  @ApiBody({ type: ModerateTargetDto })
  @ApiOkResponse({ type: ModerationActionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  @ApiNotFoundResponse({ description: 'Review not found' })
  async deleteReview(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) reviewId: string,
    @Body() body: ModerateTargetDto,
  ) {
    const user = req.user as AuthenticatedUser;

    return this.deleteReviewService.execute({
      targetId: reviewId,
      moderatorId: user.id,
      reason: body.reason,
      complaintId: body.complaintId,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN, ROLES.MODERATOR)
  @Post(ROUTES.ADMIN_COMMENT_DELETE)
  @ApiOperation({ summary: 'Delete comment and log moderation action' })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Comment id' })
  @ApiBody({ type: ModerateTargetDto })
  @ApiOkResponse({ type: ModerationActionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  async deleteComment(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) commentId: string,
    @Body() body: ModerateTargetDto,
  ) {
    const user = req.user as AuthenticatedUser;

    return this.deleteCommentService.execute({
      targetId: commentId,
      moderatorId: user.id,
      reason: body.reason,
      complaintId: body.complaintId,
    });
  }
}
