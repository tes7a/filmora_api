import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class AddFilmToListDto {
  @ApiProperty({
    example: 'f04f311b-a1ca-4fc0-a799-4b2720d7ecf2',
    description: 'Film id',
  })
  @IsUUID()
  filmId: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Optional position in list',
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  position?: number;

  @ApiPropertyOptional({
    example: 'Watch this with friends',
    description: 'Optional note for list item',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
