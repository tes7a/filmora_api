import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ModerateTargetDto {
  @ApiProperty({
    example: 'Violation of platform rules',
    description: 'Moderation reason',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason: string;

  @ApiPropertyOptional({
    example: 'f1729a2a-17a5-4df0-916e-f586a6f54c98',
    description: 'Optional complaint id to resolve while moderating',
  })
  @IsOptional()
  @IsUUID()
  complaintId?: string;
}
