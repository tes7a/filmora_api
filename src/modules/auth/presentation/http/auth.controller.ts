import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Ip,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';

import { ROUTES } from '@/utils';

import {
  AuthLocalService,
  EmailConfirmationService,
  UserRegistrationService,
} from '../../application';
import type { AuthenticatedUser, UserWithRoles } from '../../infrastructure';
import { Roles } from '../decorators';
import {
  ConfirmEmailResponseDto,
  LoginDto,
  LoginResponseDto,
  LogoutResponseDto,
  MeResponseDto,
  RefreshTokenResponseDto,
  RegisterDto,
  RegisterResponseDto,
} from '../dto';
import { JwtAuthGuard, LocalAuthGuard, RolesGuard } from '../guards';

@Controller(ROUTES.AUTH)
@ApiTags('Auth')
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 5, ttl: 60000 } })
export class AuthController {
  constructor(
    private readonly authLocalService: AuthLocalService,
    private readonly userRegistrationService: UserRegistrationService,
    private readonly emailConfirmationService: EmailConfirmationService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post(ROUTES.AUTH_LOGIN)
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials or inactive account' })
  async login(
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const user = req.user as UserWithRoles;

    return this.authLocalService.login(user, res, {
      ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post(ROUTES.AUTH_REGISTER)
  @ApiOperation({ summary: 'Register' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({ type: RegisterResponseDto })
  @ApiConflictResponse({ description: 'User with this email already exists' })
  async register(@Body() body: RegisterDto) {
    return this.userRegistrationService.register(body);
  }

  @Get(ROUTES.AUTH_CONFIRM_EMAIL)
  @ApiOperation({ summary: 'Confirm email' })
  @ApiQuery({
    name: 'token',
    required: true,
    type: String,
    description: 'Email confirmation token',
  })
  @ApiOkResponse({ type: ConfirmEmailResponseDto })
  async confirmEmail(@Query('token') token: string) {
    return this.emailConfirmationService.confirmEmail(token);
  }

  @Post(ROUTES.AUTH_REFRESH)
  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiOkResponse({ type: RefreshTokenResponseDto })
  @ApiBadRequestResponse({ description: 'Refresh token not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new BadRequestException('Refresh token not found');
    }

    const result = await this.authLocalService.refreshTokens(
      refreshToken,
      res,
      {
        ip,
        userAgent: req.headers['user-agent'],
      },
    );

    return result;
  }

  @Post(ROUTES.AUTH_LOGOUT)
  @ApiOperation({ summary: 'Logout' })
  @ApiOkResponse({ type: LogoutResponseDto })
  @ApiBadRequestResponse({ description: 'Refresh token not found' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new BadRequestException('Refresh token not found');
    }

    await this.authLocalService.logout(refreshToken, res);

    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'moderator', 'admin')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Get(ROUTES.AUTH_ME)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  @ApiOkResponse({ type: MeResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  me(@Req() req: Request): AuthenticatedUser {
    return req.user as AuthenticatedUser;
  }
}
