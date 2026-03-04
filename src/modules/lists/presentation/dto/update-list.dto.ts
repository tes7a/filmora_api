import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateListDto {
  @ApiPropertyOptional({
    example: 'Classics',
    description: 'New list name',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'List visibility',
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
