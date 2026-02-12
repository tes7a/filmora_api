import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export type AdminUserSortBy =
  | 'createdAt'
  | 'updatedAt'
  | 'lastLoginAt'
  | 'email'
  | 'displayName'
  | 'status';

export type SortOrder = 'asc' | 'desc';

export class GetUsersQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    minimum: 1,
    maximum: 100000,
    default: 1,
    example: 1,
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
    example: 20,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({
    description: 'Field used for sorting',
    enum: [
      'createdAt',
      'updatedAt',
      'lastLoginAt',
      'email',
      'displayName',
      'status',
    ],
    default: 'createdAt',
  })
  @IsIn([
    'createdAt',
    'updatedAt',
    'lastLoginAt',
    'email',
    'displayName',
    'status',
  ])
  sortBy: AdminUserSortBy = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsIn(['asc', 'desc'])
  sortOrder: SortOrder = 'desc';

  @ApiPropertyOptional({
    description: 'Case-insensitive search by email and display name',
    example: 'john',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;
}
