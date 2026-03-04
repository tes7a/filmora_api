import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  film_status,
  genre_status,
  person_status,
  tag_status,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  MinLength,
} from 'class-validator';

const SORT_ORDER = ['asc', 'desc'] as const;
const GENRE_SORT_BY = ['name', 'status', 'createdAt', 'updatedAt'] as const;
const TAG_SORT_BY = ['name', 'status', 'createdAt', 'updatedAt'] as const;
const COUNTRY_SORT_BY = ['name', 'code', 'createdAt', 'updatedAt'] as const;
const PERSON_SORT_BY = ['fullName', 'status', 'createdAt', 'updatedAt'] as const;
const FILM_SORT_BY = [
  'title',
  'status',
  'releaseYear',
  'averageRating',
  'ratingsCount',
  'popularityScore',
  'createdAt',
  'updatedAt',
] as const;

type SortOrder = (typeof SORT_ORDER)[number];

export class CreateGenreDto {
  @ApiProperty({ example: 'Sci-Fi' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'sci-fi' })
  @IsString()
  @MinLength(1)
  slug: string;

  @ApiPropertyOptional({ example: 'Science fiction movies' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: genre_status, default: genre_status.active })
  @IsOptional()
  @IsEnum(genre_status)
  status: genre_status = genre_status.active;
}

export class GetAdminGenresQueryDto {
  @ApiPropertyOptional({ description: 'Search by name/slug', example: 'sci' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  q?: string;

  @ApiPropertyOptional({ enum: genre_status })
  @IsOptional()
  @IsEnum(genre_status)
  status?: genre_status;

  @ApiPropertyOptional({ enum: GENRE_SORT_BY, default: 'name' })
  @IsIn(GENRE_SORT_BY)
  sortBy: (typeof GENRE_SORT_BY)[number] = 'name';

  @ApiPropertyOptional({ enum: SORT_ORDER, default: 'asc' })
  @IsIn(SORT_ORDER)
  sortOrder: SortOrder = 'asc';

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

export class UpdateGenreDto {
  @ApiPropertyOptional({ example: 'Sci-Fi' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ example: 'sci-fi' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  slug?: string;

  @ApiPropertyOptional({ example: 'Science fiction movies', nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ enum: genre_status })
  @IsOptional()
  @IsEnum(genre_status)
  status?: genre_status;
}

export class MergeGenreDto {
  @ApiProperty({ example: '8b756f0e-90da-4eb4-b68c-6e3775af73b7' })
  @IsUUID()
  targetGenreId: string;
}

export class CreateTagDto {
  @ApiProperty({ example: 'Cyberpunk' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'cyberpunk' })
  @IsString()
  @MinLength(1)
  slug: string;

  @ApiPropertyOptional({ example: 'Cyberpunk themed content' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: tag_status, default: tag_status.active })
  @IsOptional()
  @IsEnum(tag_status)
  status: tag_status = tag_status.active;
}

export class GetAdminTagsQueryDto {
  @ApiPropertyOptional({ description: 'Search by name/slug', example: 'cyber' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  q?: string;

  @ApiPropertyOptional({ enum: tag_status })
  @IsOptional()
  @IsEnum(tag_status)
  status?: tag_status;

  @ApiPropertyOptional({ enum: TAG_SORT_BY, default: 'name' })
  @IsIn(TAG_SORT_BY)
  sortBy: (typeof TAG_SORT_BY)[number] = 'name';

  @ApiPropertyOptional({ enum: SORT_ORDER, default: 'asc' })
  @IsIn(SORT_ORDER)
  sortOrder: SortOrder = 'asc';

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

export class UpdateTagDto {
  @ApiPropertyOptional({ example: 'Cyberpunk' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ example: 'cyberpunk' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  slug?: string;

  @ApiPropertyOptional({ example: 'Cyberpunk themed content', nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ enum: tag_status })
  @IsOptional()
  @IsEnum(tag_status)
  status?: tag_status;
}

export class CreateCountryDto {
  @ApiProperty({ example: 'US' })
  @IsString()
  @Length(2, 2)
  code: string;

  @ApiProperty({ example: 'United States' })
  @IsString()
  @MinLength(1)
  name: string;
}

export class GetAdminCountriesQueryDto {
  @ApiPropertyOptional({ description: 'Search by name/code', example: 'usa' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  q?: string;

  @ApiPropertyOptional({ enum: COUNTRY_SORT_BY, default: 'name' })
  @IsIn(COUNTRY_SORT_BY)
  sortBy: (typeof COUNTRY_SORT_BY)[number] = 'name';

  @ApiPropertyOptional({ enum: SORT_ORDER, default: 'asc' })
  @IsIn(SORT_ORDER)
  sortOrder: SortOrder = 'asc';

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

export class UpdateCountryDto {
  @ApiPropertyOptional({ example: 'US' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  code?: string;

  @ApiPropertyOptional({ example: 'United States' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;
}

export class CreatePersonDto {
  @ApiProperty({ example: 'Keanu Reeves' })
  @IsString()
  @MinLength(1)
  fullName: string;

  @ApiProperty({ example: 'keanu-reeves' })
  @IsString()
  @MinLength(1)
  slug: string;

  @ApiPropertyOptional({ example: '1964-09-02', format: 'date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthDate?: Date;

  @ApiPropertyOptional({ example: '2030-01-01', format: 'date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deathDate?: Date;

  @ApiPropertyOptional({ example: 'Canadian actor.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ enum: person_status, default: person_status.visible })
  @IsOptional()
  @IsEnum(person_status)
  status: person_status = person_status.visible;
}

export class GetAdminPersonsQueryDto {
  @ApiPropertyOptional({ description: 'Search by full name/slug', example: 'keanu' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  q?: string;

  @ApiPropertyOptional({ enum: person_status })
  @IsOptional()
  @IsEnum(person_status)
  status?: person_status;

  @ApiPropertyOptional({ enum: PERSON_SORT_BY, default: 'fullName' })
  @IsIn(PERSON_SORT_BY)
  sortBy: (typeof PERSON_SORT_BY)[number] = 'fullName';

  @ApiPropertyOptional({ enum: SORT_ORDER, default: 'asc' })
  @IsIn(SORT_ORDER)
  sortOrder: SortOrder = 'asc';

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

export class UpdatePersonDto {
  @ApiPropertyOptional({ example: 'Keanu Reeves' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  fullName?: string;

  @ApiPropertyOptional({ example: 'keanu-reeves' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  slug?: string;

  @ApiPropertyOptional({ example: '1964-09-02', format: 'date', nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthDate?: Date | null;

  @ApiPropertyOptional({ example: '2030-01-01', format: 'date', nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deathDate?: Date | null;

  @ApiPropertyOptional({ example: 'Canadian actor.', nullable: true })
  @IsOptional()
  @IsString()
  bio?: string | null;

  @ApiPropertyOptional({ enum: person_status })
  @IsOptional()
  @IsEnum(person_status)
  status?: person_status;
}

export class CreateAdminFilmDto {
  @ApiProperty({ example: 'The Matrix' })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({ example: 'The Matrix' })
  @IsString()
  @MinLength(1)
  originalTitle: string;

  @ApiPropertyOptional({ example: 'A hacker learns the truth about his world.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1999 })
  @IsInt()
  @Min(1888)
  @Max(3000)
  releaseYear: number;

  @ApiProperty({ example: 136 })
  @IsInt()
  @Min(1)
  @Max(1000)
  durationMin: number;

  @ApiPropertyOptional({ example: 'R' })
  @IsOptional()
  @IsString()
  ageRating?: string;

  @ApiPropertyOptional({ enum: film_status, default: film_status.visible })
  @IsOptional()
  @IsEnum(film_status)
  status: film_status = film_status.visible;

  @ApiPropertyOptional({ example: 100.5 })
  @IsOptional()
  @IsNumber()
  popularityScore?: number;
}

export class GetAdminFilmsQueryDto {
  @ApiPropertyOptional({ description: 'Search by title/originalTitle', example: 'matrix' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  q?: string;

  @ApiPropertyOptional({ enum: film_status })
  @IsOptional()
  @IsEnum(film_status)
  status?: film_status;

  @ApiPropertyOptional({ example: 1990 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1888)
  @Max(3000)
  yearFrom?: number;

  @ApiPropertyOptional({ example: 2026 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1888)
  @Max(3000)
  yearTo?: number;

  @ApiPropertyOptional({ example: 6.5, minimum: 0, maximum: 10 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  ratingFrom?: number;

  @ApiPropertyOptional({ example: 9.8, minimum: 0, maximum: 10 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  ratingTo?: number;

  @ApiPropertyOptional({ enum: FILM_SORT_BY, default: 'createdAt' })
  @IsIn(FILM_SORT_BY)
  sortBy: (typeof FILM_SORT_BY)[number] = 'createdAt';

  @ApiPropertyOptional({ enum: SORT_ORDER, default: 'desc' })
  @IsIn(SORT_ORDER)
  sortOrder: SortOrder = 'desc';

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

export class UpdateAdminFilmDto {
  @ApiPropertyOptional({ example: 'The Matrix' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @ApiPropertyOptional({ example: 'The Matrix' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  originalTitle?: string;

  @ApiPropertyOptional({ example: 'A hacker learns the truth about his world.', nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ example: 1999 })
  @IsOptional()
  @IsInt()
  @Min(1888)
  @Max(3000)
  releaseYear?: number;

  @ApiPropertyOptional({ example: 136 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  durationMin?: number;

  @ApiPropertyOptional({ example: 'R', nullable: true })
  @IsOptional()
  @IsString()
  ageRating?: string | null;

  @ApiPropertyOptional({ enum: film_status })
  @IsOptional()
  @IsEnum(film_status)
  status?: film_status;

  @ApiPropertyOptional({ example: 100.5 })
  @IsOptional()
  @IsNumber()
  popularityScore?: number;
}
