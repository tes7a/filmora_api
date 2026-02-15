import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Put,
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
import { JwtAuthGuard } from '@/modules/auth/presentation';
import { ROUTES } from '@/utils';

import { DeleteCommentService, UpdateCommentService } from '../../application';
import { CommentResponseDto, UpdateCommentDto } from '../dto';

@Controller(ROUTES.COMMENTS)
@ApiTags('Comments')
export class CommentsController {
  constructor(
    private readonly updateCommentService: UpdateCommentService,
    private readonly deleteCommentService: DeleteCommentService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Put(ROUTES.COMMENT_BY_ID)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own comment' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Comment id',
  })
  @ApiBody({ type: UpdateCommentDto })
  @ApiOkResponse({ type: CommentResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  async updateComment(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) commentId: string,
    @Body() body: UpdateCommentDto,
  ) {
    const user = req.user as AuthenticatedUser;

    return this.updateCommentService.execute({
      commentId,
      userId: user.id,
      body: body.body,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(ROUTES.COMMENT_BY_ID)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete own comment' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Comment id',
  })
  @ApiOkResponse({ type: CommentResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  async deleteComment(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) commentId: string,
  ) {
    const user = req.user as AuthenticatedUser;

    return this.deleteCommentService.execute({
      commentId,
      userId: user.id,
    });
  }
}
