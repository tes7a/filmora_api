import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { ThrottlerGuard } from '@nestjs/throttler';

@UseGuards(ThrottlerGuard)
@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly health: HealthCheckService) {}

  @Get('health')
  @HealthCheck()
  @ApiOperation({ summary: 'Health check' })
  healthcheck() {
    return this.health.check([async () => ({ api: { status: 'up' } })]);
  }
}
