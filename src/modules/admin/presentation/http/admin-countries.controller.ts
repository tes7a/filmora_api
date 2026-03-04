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

import { ManageCountriesService } from '../../application';
import {
  CountryResponseDto,
  CreateCountryDto,
  DeleteResponseDto,
  GetAdminCountriesQueryDto,
  PaginatedCountriesResponseDto,
  UpdateCountryDto,
} from '../dto';

@Controller(ROUTES.ADMIN)
@ApiTags('Admin Countries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN, ROLES.MODERATOR)
export class AdminCountriesController {
  constructor(private readonly manageCountriesService: ManageCountriesService) {}

  @Get(ROUTES.ADMIN_COUNTRIES)
  @ApiOperation({ summary: 'Get countries' })
  @ApiOkResponse({ type: PaginatedCountriesResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error for query params' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  async getCountries(@Query() query: GetAdminCountriesQueryDto) {
    return this.manageCountriesService.getAll(query);
  }

  @Post(ROUTES.ADMIN_COUNTRIES)
  @ApiOperation({ summary: 'Create country' })
  @ApiBody({ type: CreateCountryDto })
  @ApiOkResponse({ type: CountryResponseDto })
  async createCountry(@Body() body: CreateCountryDto) {
    return this.manageCountriesService.create(body);
  }

  @Patch(ROUTES.ADMIN_COUNTRY_BY_ID)
  @ApiOperation({ summary: 'Update country' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateCountryDto })
  @ApiOkResponse({ type: CountryResponseDto })
  @ApiNotFoundResponse({ description: 'Country not found' })
  async updateCountry(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateCountryDto,
  ) {
    return this.manageCountriesService.update({ id, ...body });
  }

  @Delete(ROUTES.ADMIN_COUNTRY_BY_ID)
  @ApiOperation({ summary: 'Delete country' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: DeleteResponseDto })
  @ApiNotFoundResponse({ description: 'Country not found' })
  async deleteCountry(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.manageCountriesService.delete(id);

    return { deleted: true as const };
  }
}
