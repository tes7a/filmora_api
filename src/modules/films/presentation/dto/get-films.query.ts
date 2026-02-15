import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
} from 'class-validator';

const FILMS_SORT_BY = ['rating', 'date', 'popularity'] as const;
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

function toNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
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
  q?: string;

  @ApiPropertyOptional({
    description: 'Genre ids. CSV or repeated query params are supported',
    type: [String],
    example: [
      '0d1f4667-e9c8-4ac6-9d11-682de1f06b52',
      '9ba189b7-a337-4edf-aa1f-70e41c003337',
    ],
  })
  @Transform(({ value }) => toStringArray(value))
  @IsOptional()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  genreIds?: string[];

  @ApiPropertyOptional({
    description: 'Tag ids. CSV or repeated query params are supported',
    type: [String],
    example: [
      '12474e2e-2936-4a1d-a885-5fe1a74f4529',
      '25664376-3e6c-40f7-bfb7-af10bacd1a2d',
    ],
  })
  @Transform(({ value }) => toStringArray(value))
  @IsOptional()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  tagIds?: string[];

  @ApiPropertyOptional({
    description: 'Country ids. CSV or repeated query params are supported',
    type: [String],
    example: [
      'bfb6fd98-bf97-4996-b8e5-e08ce59477cf',
      'f272ea98-4b54-4f6a-b752-b97456943f43',
    ],
  })
  @Transform(({ value }) => toStringArray(value))
  @IsOptional()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  countryIds?: string[];

  @ApiPropertyOptional({
    description: 'Release year lower bound',
    minimum: 1888,
    maximum: 3000,
    example: 1990,
  })
  @Transform(({ value }) => toNumber(value))
  @IsOptional()
  @IsInt()
  @Min(1888)
  @Max(3000)
  yearFrom?: number;

  @ApiPropertyOptional({
    description: 'Release year upper bound',
    minimum: 1888,
    maximum: 3000,
    example: 2025,
  })
  @Transform(({ value }) => toNumber(value))
  @IsOptional()
  @IsInt()
  @Min(1888)
  @Max(3000)
  yearTo?: number;

  @ApiPropertyOptional({
    description: 'Average rating lower bound',
    minimum: 0,
    maximum: 10,
    example: 7.5,
  })
  @Transform(({ value }) => toNumber(value))
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  ratingFrom?: number;

  @ApiPropertyOptional({
    description: 'Average rating upper bound',
    minimum: 0,
    maximum: 10,
    example: 9.8,
  })
  @Transform(({ value }) => toNumber(value))
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  ratingTo?: number;

  @ApiPropertyOptional({
    description: 'Sort mode',
    enum: FILMS_SORT_BY,
    default: 'date',
  })
  @IsIn(FILMS_SORT_BY)
  sortBy: FilmsSortBy = 'date';

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
  pageSize: number = 20;
}
