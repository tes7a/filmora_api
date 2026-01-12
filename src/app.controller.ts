import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { IsInt, IsString, Max, Min, MinLength } from 'class-validator';

import { AppService } from './app.service';

class HelloResponseDto {
  @ApiProperty({ example: 'Hello World!' })
  message!: string;
}

class EchoRequestDto {
  @ApiProperty({ example: 'Inception' })
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty({ example: 2010, minimum: 1800, maximum: 2100 })
  @IsInt()
  @Min(1800)
  @Max(2100)
  year!: number;
}

class EchoResponseDto {
  @ApiProperty({ example: 'Inception (2010)' })
  summary!: string;
}

@UseGuards(ThrottlerGuard) // tighter for login // ✅ throttling only inside this controller
@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Get()
  @ApiOkResponse({ type: HelloResponseDto })
  getHello(): HelloResponseDto {
    return { message: this.appService.getHello() };
  }

  @Post('echo')
  @ApiBody({ type: EchoRequestDto })
  @ApiOkResponse({ type: EchoResponseDto })
  echo(@Body() dto: EchoRequestDto): EchoResponseDto {
    return { summary: `${dto.title} (${dto.year})` };
  }
}
