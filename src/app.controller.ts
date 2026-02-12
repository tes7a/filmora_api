import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { ThrottlerGuard } from '@nestjs/throttler';

class HealthIndicatorResponseDto {
  @ApiProperty({ example: 'up' })
  status: string;
}

class HealthCheckResponseDto {
  @ApiProperty({ type: HealthIndicatorResponseDto })
  api: HealthIndicatorResponseDto;
}

@UseGuards(ThrottlerGuard)
@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly health: HealthCheckService) {}

  @Get('health')
  @HealthCheck()
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({ type: HealthCheckResponseDto })
  healthcheck() {
    return this.health.check([async () => ({ api: { status: 'up' } })]);
  }
}
