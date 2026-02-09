import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import type { AuthenticatedUser } from '@/modules/auth/infrastructure';
import { JwtAuthGuard, Roles, RolesGuard } from '@/modules/auth/presentation';
import { ROUTES } from '@/utils';

import { GetUsersService } from '../../application';

@Controller(ROUTES.ADMIN)
export class AdminController {
  constructor(private readonly getUsersService: GetUsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('moderator', 'admin')
  @Get(ROUTES.ADMIN_USERS)
  async getUsers(@Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.getUsersService.execute(user.id);
  }
}
