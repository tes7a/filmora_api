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

import { ManageTagsService } from '../../application';
import {
  CreateTagDto,
  DeleteResponseDto,
  GetAdminTagsQueryDto,
  PaginatedTagsResponseDto,
  TagResponseDto,
  UpdateTagDto,
} from '../dto';

@Controller(ROUTES.ADMIN)
@ApiTags('Admin Tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN, ROLES.MODERATOR)
export class AdminTagsController {
  constructor(private readonly manageTagsService: ManageTagsService) {}

  @Get(ROUTES.ADMIN_TAGS)
  @ApiOperation({ summary: 'Get tags' })
  @ApiOkResponse({ type: PaginatedTagsResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error for query params' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  async getTags(@Query() query: GetAdminTagsQueryDto) {
    return this.manageTagsService.getAll(query);
  }

  @Post(ROUTES.ADMIN_TAGS)
  @ApiOperation({ summary: 'Create tag' })
  @ApiBody({ type: CreateTagDto })
  @ApiOkResponse({ type: TagResponseDto })
  async createTag(@Body() body: CreateTagDto) {
    return this.manageTagsService.create(body);
  }

  @Patch(ROUTES.ADMIN_TAG_BY_ID)
  @ApiOperation({ summary: 'Update tag' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateTagDto })
  @ApiOkResponse({ type: TagResponseDto })
  @ApiNotFoundResponse({ description: 'Tag not found' })
  async updateTag(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateTagDto,
  ) {
    return this.manageTagsService.update({ id, ...body });
  }

  @Delete(ROUTES.ADMIN_TAG_BY_ID)
  @ApiOperation({ summary: 'Delete tag' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: DeleteResponseDto })
  @ApiNotFoundResponse({ description: 'Tag not found' })
  async deleteTag(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.manageTagsService.delete(id);

    return { deleted: true as const };
  }
}
