import { ApiPropertyOptional } from '@nestjs/swagger';
import { complaint_status } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class GetComplaintsQueryDto {
  @ApiPropertyOptional({
    enum: complaint_status,
    description: 'Complaint status filter',
    example: complaint_status.pending,
  })
  @IsOptional()
  @IsEnum(complaint_status)
  status?: complaint_status;

  @ApiPropertyOptional({
    description: 'Page number',
    minimum: 1,
    maximum: 100000,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @Max(100000)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
