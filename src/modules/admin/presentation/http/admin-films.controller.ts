import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
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

import { JwtAuthGuard, Roles, RolesGuard } from '@/modules/auth/presentation';
import { ROLES, ROUTES } from '@/utils';

import { ManageFilmsService } from '../../application';
import {
  AdminFilmResponseDto,
  CreateAdminFilmDto,
  DeleteResponseDto,
  GetAdminFilmsQueryDto,
  PaginatedAdminFilmsResponseDto,
  UpdateAdminFilmDto,
} from '../dto';

@Controller(ROUTES.ADMIN)
@ApiTags('Admin Films')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN, ROLES.MODERATOR)
export class AdminFilmsController {
  constructor(private readonly manageFilmsService: ManageFilmsService) {}

  @Get(ROUTES.FILMS)
  @ApiOperation({ summary: 'Get films for admin' })
  @ApiOkResponse({ type: PaginatedAdminFilmsResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error for query params' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  async getFilms(@Query() query: GetAdminFilmsQueryDto) {
    return this.manageFilmsService.getAll(query);
  }

  @Post(ROUTES.FILMS)
  @ApiOperation({ summary: 'Create film' })
  @ApiBody({ type: CreateAdminFilmDto })
  @ApiOkResponse({ type: AdminFilmResponseDto })
  async createFilm(@Body() body: CreateAdminFilmDto) {
    return this.manageFilmsService.create(body);
  }

  @Patch(ROUTES.ADMIN_FILM_BY_ID)
  @ApiOperation({ summary: 'Update film' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateAdminFilmDto })
  @ApiOkResponse({ type: AdminFilmResponseDto })
  @ApiNotFoundResponse({ description: 'Film not found' })
  async updateFilm(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateAdminFilmDto,
  ) {
    return this.manageFilmsService.update({ id, ...body });
  }

  @Delete(ROUTES.ADMIN_FILM_BY_ID)
  @ApiOperation({ summary: 'Delete film' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: DeleteResponseDto })
  @ApiNotFoundResponse({ description: 'Film not found' })
  async deleteFilm(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.manageFilmsService.delete(id);

    return { deleted: true as const };
  }
}
