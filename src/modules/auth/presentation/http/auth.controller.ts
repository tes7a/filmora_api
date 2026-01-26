import {
  Body,
  Controller,
  Get,
  Ip,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { ROUTES } from '@/utils';

import {
  AuthLocalService,
  EmailConfirmationService,
  UserRegistrationService,
} from '../../application';
import { LoginDto, RegisterDto } from '../dto';

@Controller(ROUTES.AUTH)
export class AuthController {
  constructor(
    private readonly authLocalService: AuthLocalService,
    private readonly userRegistrationService: UserRegistrationService,
    private readonly emailConfirmationService: EmailConfirmationService,
  ) {}

  @Post(ROUTES.AUTH_LOGIN)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const result = await this.authLocalService.login(body, res, {
      ip,
      userAgent: req.headers['user-agent'],
    });

    return result;
  }

  @Post(ROUTES.AUTH_REGISTER)
  async register(@Body() body: RegisterDto) {
    return this.userRegistrationService.register(body);
  }

  @Get(ROUTES.AUTH_CONFIRM_EMAIL)
  async confirmEmail(@Query('token') token: string) {
    return this.emailConfirmationService.confirmEmail(token);
  }

  @Post(ROUTES.AUTH_REFRESH)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    const result = await this.authLocalService.refreshTokens(refreshToken, res, {
      ip,
      userAgent: req.headers['user-agent'],
    });

    return result;
  }

  @Post(ROUTES.AUTH_LOGOUT)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    await this.authLocalService.logout(refreshToken, res);

    return { message: 'Logged out successfully' };
  }
}
