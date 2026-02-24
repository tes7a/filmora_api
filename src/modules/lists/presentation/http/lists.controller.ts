import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';

import type { AuthenticatedUser } from '@/modules/auth/infrastructure';
import { JwtAuthGuard } from '@/modules/auth/presentation';
import { ROUTES } from '@/utils';

import {
  AddFilmToListService,
  CreateCustomListService,
  GetMyListsService,
  RemoveFilmFromListService,
  UpdateListService,
} from '../../application';
import {
  AddFilmToListDto,
  CreateCustomListDto,
  UpdateListDto,
  UserListResponseDto,
} from '../dto';

@Controller()
@ApiTags('Lists')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ListsController {
  constructor(
    private readonly getMyListsService: GetMyListsService,
    private readonly createCustomListService: CreateCustomListService,
    private readonly addFilmToListService: AddFilmToListService,
    private readonly removeFilmFromListService: RemoveFilmFromListService,
    private readonly updateListService: UpdateListService,
  ) {}

  @Get(ROUTES.ME_LISTS)
  @ApiOperation({ summary: 'Get all lists for current user' })
  @ApiOkResponse({ type: UserListResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getMyLists(@Req() req: Request) {
    const user = req.user as AuthenticatedUser;

    return this.getMyListsService.execute(user.id);
  }

  @Post(ROUTES.LISTS)
  @ApiOperation({ summary: 'Create custom list' })
  @ApiBody({ type: CreateCustomListDto })
  @ApiOkResponse({ type: UserListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async createCustomList(@Req() req: Request, @Body() body: CreateCustomListDto) {
    const user = req.user as AuthenticatedUser;

    return this.createCustomListService.execute({
      userId: user.id,
      name: body.name,
      isPublic: body.isPublic,
    });
  }

  @Post(ROUTES.LIST_ITEMS)
  @ApiOperation({ summary: 'Add film to list' })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'List id' })
  @ApiBody({ type: AddFilmToListDto })
  @ApiOkResponse({ type: UserListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'List or film not found' })
  async addFilmToList(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) listId: string,
    @Body() body: AddFilmToListDto,
  ) {
    const user = req.user as AuthenticatedUser;

    return this.addFilmToListService.execute({
      userId: user.id,
      listId,
      filmId: body.filmId,
      position: body.position,
      note: body.note,
    });
  }

  @Delete(ROUTES.LIST_ITEM_BY_FILM)
  @ApiOperation({ summary: 'Remove film from list' })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'List id' })
  @ApiParam({ name: 'filmId', type: String, format: 'uuid', description: 'Film id' })
  @ApiOkResponse({ type: UserListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'List item not found' })
  async removeFilmFromList(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) listId: string,
    @Param('filmId', new ParseUUIDPipe()) filmId: string,
  ) {
    const user = req.user as AuthenticatedUser;

    return this.removeFilmFromListService.execute({
      userId: user.id,
      listId,
      filmId,
    });
  }

  @Patch(ROUTES.LIST_BY_ID)
  @ApiOperation({ summary: 'Update custom list name/privacy' })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'List id' })
  @ApiBody({ type: UpdateListDto })
  @ApiOkResponse({ type: UserListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'List not found' })
  async updateList(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) listId: string,
    @Body() body: UpdateListDto,
  ) {
    const user = req.user as AuthenticatedUser;

    return this.updateListService.execute({
      userId: user.id,
      listId,
      name: body.name,
      isPublic: body.isPublic,
    });
  }
}
