import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';

import type { AuthenticatedUser } from '@/modules/auth/infrastructure';
import { JwtAuthGuard, Roles, RolesGuard } from '@/modules/auth/presentation';
import { ROUTES } from '@/utils';

import { GetUsersService } from '../../application';
import { GetUsersQueryDto } from '../dto/get-users.query';
import { PaginatedAdminUsersResponseDto } from '../dto/users-response.dto';

@Controller(ROUTES.ADMIN)
@ApiTags('Admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly getUsersService: GetUsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('moderator', 'admin')
  @Get(ROUTES.ADMIN_USERS)
  @ApiOperation({ summary: 'Get users (paginated)' })
  @ApiOkResponse({ type: PaginatedAdminUsersResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  async getUsers(@Req() req: Request, @Query() query: GetUsersQueryDto) {
    const user = req.user as AuthenticatedUser;
    return this.getUsersService.execute({
      excludeUserId: user.id,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      search: query.search,
    });
  }
}
