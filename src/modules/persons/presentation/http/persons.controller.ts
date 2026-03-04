import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { ROUTES } from '@/utils';

import { GetPersonByIdService, GetPersonsService } from '../../application';
import {
  GetPersonsQueryDto,
  PaginatedPersonsResponseDto,
  PersonDetailsResponseDto,
} from '../dto';

@Controller(ROUTES.ADMIN_PERSONS)
@ApiTags('Persons')
export class PersonsController {
  constructor(
    private readonly getPersonsService: GetPersonsService,
    private readonly getPersonByIdService: GetPersonByIdService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get persons list with search/sort/pagination' })
  @ApiOkResponse({ type: PaginatedPersonsResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error for query params' })
  async getPersons(@Query() query: GetPersonsQueryDto) {
    return this.getPersonsService.execute({
      q: query.q,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get person by id' })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Person id' })
  @ApiOkResponse({ type: PersonDetailsResponseDto })
  @ApiNotFoundResponse({ description: 'Person not found' })
  async getPersonById(@Param('id', new ParseUUIDPipe()) personId: string) {
    return this.getPersonByIdService.execute(personId);
  }
}
