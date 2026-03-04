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

import { ManageGenresService } from '../../application';
import {
  CreateGenreDto,
  DeleteResponseDto,
  GenreResponseDto,
  GetAdminGenresQueryDto,
  MergeGenreDto,
  PaginatedGenresResponseDto,
  UpdateGenreDto,
} from '../dto';

@Controller(ROUTES.ADMIN)
@ApiTags('Admin Genres')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN, ROLES.MODERATOR)
export class AdminGenresController {
  constructor(private readonly manageGenresService: ManageGenresService) {}

  @Get(ROUTES.ADMIN_GENRES)
  @ApiOperation({ summary: 'Get genres' })
  @ApiOkResponse({ type: PaginatedGenresResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error for query params' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  async getGenres(@Query() query: GetAdminGenresQueryDto) {
    return this.manageGenresService.getAll(query);
  }

  @Post(ROUTES.ADMIN_GENRES)
  @ApiOperation({ summary: 'Create genre' })
  @ApiBody({ type: CreateGenreDto })
  @ApiOkResponse({ type: GenreResponseDto })
  async createGenre(@Body() body: CreateGenreDto) {
    return this.manageGenresService.create(body);
  }

  @Patch(ROUTES.ADMIN_GENRE_BY_ID)
  @ApiOperation({ summary: 'Update genre' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateGenreDto })
  @ApiOkResponse({ type: GenreResponseDto })
  @ApiNotFoundResponse({ description: 'Genre not found' })
  async updateGenre(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateGenreDto,
  ) {
    return this.manageGenresService.update({ id, ...body });
  }

  @Delete(ROUTES.ADMIN_GENRE_BY_ID)
  @ApiOperation({ summary: 'Delete genre' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: DeleteResponseDto })
  @ApiNotFoundResponse({ description: 'Genre not found' })
  async deleteGenre(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.manageGenresService.delete(id);

    return { deleted: true as const };
  }

  @Post(ROUTES.ADMIN_GENRE_MERGE)
  @ApiOperation({ summary: 'Merge source genre into target genre' })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Source genre id' })
  @ApiBody({ type: MergeGenreDto })
  @ApiOkResponse({ type: GenreResponseDto })
  @ApiNotFoundResponse({ description: 'Source or target genre not found' })
  async mergeGenre(
    @Param('id', new ParseUUIDPipe()) sourceGenreId: string,
    @Body() body: MergeGenreDto,
  ) {
    return this.manageGenresService.merge({
      sourceGenreId,
      targetGenreId: body.targetGenreId,
    });
  }
}
