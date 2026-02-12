import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

const FILMS_SORT_BY = ['rating', 'newest'] as const;
const SORT_ORDER = ['asc', 'desc'] as const;

export type FilmsSortBy = (typeof FILMS_SORT_BY)[number];
export type SortOrder = (typeof SORT_ORDER)[number];

function toStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => String(item).split(','))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return undefined;
}

function toNumberArray(value: unknown): number[] | undefined {
  const values = toStringArray(value);

  if (!values?.length) {
    return undefined;
  }

  return values
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item));
}

export class GetFilmsQueryDto {
  @ApiPropertyOptional({
    description: 'Search by film title (contains, case-insensitive)',
    example: 'matrix',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;

  @ApiPropertyOptional({
    description: 'Genre slugs. CSV or repeated query params are supported',
    type: [String],
    example: ['sci-fi', 'drama'],
  })
  @Transform(({ value }) => toStringArray(value))
  @IsOptional()
  @ArrayUnique()
  @IsString({ each: true })
  genres?: string[];

  @ApiPropertyOptional({
    description: 'Release years. CSV or repeated query params are supported',
    type: [Number],
    example: [1999, 2003],
  })
  @Transform(({ value }) => toNumberArray(value))
  @IsOptional()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1888, { each: true })
  @Max(3000, { each: true })
  years?: number[];

  @ApiPropertyOptional({
    description: 'Sort mode: by rating or by novelty (release year)',
    enum: FILMS_SORT_BY,
    default: 'newest',
  })
  @IsIn(FILMS_SORT_BY)
  sortBy: FilmsSortBy = 'newest';

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: SORT_ORDER,
    default: 'desc',
  })
  @IsIn(SORT_ORDER)
  sortOrder: SortOrder = 'desc';

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
