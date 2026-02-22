import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';

import type { AuthenticatedUser } from '@/modules/auth/infrastructure';
import { JwtAuthGuard } from '@/modules/auth/presentation';
import { ROUTES } from '@/utils';

import { CreateComplaintService } from '../../application';
import { ComplaintResponseDto, CreateComplaintDto } from '../dto';

@Controller(ROUTES.COMPLAINTS)
@ApiTags('Complaints')
export class ComplaintsController {
  constructor(private readonly createComplaintService: CreateComplaintService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create complaint for review/comment' })
  @ApiBody({ type: CreateComplaintDto })
  @ApiOkResponse({ type: ComplaintResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Target not found' })
  async createComplaint(@Req() req: Request, @Body() body: CreateComplaintDto) {
    const user = req.user as AuthenticatedUser;

    return this.createComplaintService.execute({
      userId: user.id,
      targetType: body.targetType,
      targetId: body.targetId,
      reason: body.reason,
    });
  }
}
