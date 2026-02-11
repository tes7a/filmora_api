import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import type { AuthenticatedUser } from '@/modules/auth/infrastructure';
import { JwtAuthGuard, Roles, RolesGuard } from '@/modules/auth/presentation';
import { ROUTES } from '@/utils';

import { GetUsersService } from '../../application';
import { GetUsersQueryDto } from '../dto/get-users.query';

@Controller(ROUTES.ADMIN)
@ApiTags('Admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly getUsersService: GetUsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('moderator', 'admin')
  @Get(ROUTES.ADMIN_USERS)
  @ApiOperation({ summary: 'Get users (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: [
      'createdAt',
      'updatedAt',
      'lastLoginAt',
      'email',
      'displayName',
      'status',
    ],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'search', required: false, type: String })
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
