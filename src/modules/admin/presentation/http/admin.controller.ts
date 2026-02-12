import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
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
import { ROUTES } from '@/utils';

import { AddUserRoleService, GetUsersService, UpdateUserStatusService } from '../../application';
import { AddUserRoleDto } from '../dto/add-user-role.dto';
import { GetUsersQueryDto } from '../dto/get-users.query';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import {
  AdminUserResponseDto,
  PaginatedAdminUsersResponseDto,
} from '../dto/users-response.dto';

@Controller(ROUTES.ADMIN)
@ApiTags('Admin')
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly getUsersService: GetUsersService,
    private readonly updateUserStatusService: UpdateUserStatusService,
    private readonly addUserRoleService: AddUserRoleService,
  ) {}

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(ROUTES.ADMIN_USER_STATUS)
  @ApiOperation({ summary: 'Update user status' })
  @ApiParam({
    name: 'userId',
    type: String,
    format: 'uuid',
    description: 'Target user id',
  })
  @ApiBody({ type: UpdateUserStatusDto })
  @ApiOkResponse({ type: AdminUserResponseDto, description: 'Updated user data' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async updateUserStatus(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() body: UpdateUserStatusDto,
  ) {
    return this.updateUserStatusService.execute({
      userId,
      status: body.status,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(ROUTES.ADMIN_USER_ROLE)
  @ApiOperation({ summary: 'Add role to user' })
  @ApiParam({
    name: 'userId',
    type: String,
    format: 'uuid',
    description: 'Target user id',
  })
  @ApiBody({ type: AddUserRoleDto })
  @ApiOkResponse({ type: AdminUserResponseDto, description: 'Updated user data' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  @ApiNotFoundResponse({ description: 'User or role not found' })
  @ApiConflictResponse({ description: 'Role is already assigned to this user' })
  async addUserRole(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() body: AddUserRoleDto,
  ) {
    return this.addUserRoleService.execute({
      userId,
      roleCode: body.role,
    });
  }
}
