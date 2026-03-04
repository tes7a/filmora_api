import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

const SORT_BY = ['fullName', 'createdAt', 'updatedAt'] as const;
const SORT_ORDER = ['asc', 'desc'] as const;

export type PersonsSortBy = (typeof SORT_BY)[number];
export type SortOrder = (typeof SORT_ORDER)[number];

export class GetPersonsQueryDto {
  @ApiPropertyOptional({ description: 'Search by fullName/slug', example: 'nolan' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  q?: string;

  @ApiPropertyOptional({ enum: SORT_BY, default: 'fullName' })
  @IsIn(SORT_BY)
  sortBy: PersonsSortBy = 'fullName';

  @ApiPropertyOptional({ enum: SORT_ORDER, default: 'asc' })
  @IsIn(SORT_ORDER)
  sortOrder: SortOrder = 'asc';

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  @Max(100000)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 20;
}
