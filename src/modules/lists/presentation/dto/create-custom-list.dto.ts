import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCustomListDto {
  @ApiProperty({
    example: 'Top Sci-Fi',
    description: 'Custom list name',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: false,
    description: 'List visibility',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
