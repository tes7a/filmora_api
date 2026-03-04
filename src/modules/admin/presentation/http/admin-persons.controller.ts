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

import { ManagePersonsService } from '../../application';
import {
  CreatePersonDto,
  DeleteResponseDto,
  GetAdminPersonsQueryDto,
  PaginatedPersonsResponseDto,
  PersonResponseDto,
  UpdatePersonDto,
} from '../dto';

@Controller(ROUTES.ADMIN)
@ApiTags('Admin Persons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN, ROLES.MODERATOR)
export class AdminPersonsController {
  constructor(private readonly managePersonsService: ManagePersonsService) {}

  @Get(ROUTES.ADMIN_PERSONS)
  @ApiOperation({ summary: 'Get persons' })
  @ApiOkResponse({ type: PaginatedPersonsResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error for query params' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  async getPersons(@Query() query: GetAdminPersonsQueryDto) {
    return this.managePersonsService.getAll(query);
  }

  @Post(ROUTES.ADMIN_PERSONS)
  @ApiOperation({ summary: 'Create person' })
  @ApiBody({ type: CreatePersonDto })
  @ApiOkResponse({ type: PersonResponseDto })
  async createPerson(@Body() body: CreatePersonDto) {
    return this.managePersonsService.create(body);
  }

  @Patch(ROUTES.ADMIN_PERSON_BY_ID)
  @ApiOperation({ summary: 'Update person' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdatePersonDto })
  @ApiOkResponse({ type: PersonResponseDto })
  @ApiNotFoundResponse({ description: 'Person not found' })
  async updatePerson(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdatePersonDto,
  ) {
    return this.managePersonsService.update({ id, ...body });
  }

  @Delete(ROUTES.ADMIN_PERSON_BY_ID)
  @ApiOperation({ summary: 'Delete person' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: DeleteResponseDto })
  @ApiNotFoundResponse({ description: 'Person not found' })
  async deletePerson(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.managePersonsService.delete(id);

    return { deleted: true as const };
  }
}
