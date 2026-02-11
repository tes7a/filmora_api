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
  @IsInt()
  @Min(1)
  @Max(100000)
  page: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsIn([
    'createdAt',
    'updatedAt',
    'lastLoginAt',
    'email',
    'displayName',
    'status',
  ])
  sortBy: AdminUserSortBy = 'createdAt';

  @IsIn(['asc', 'desc'])
  sortOrder: SortOrder = 'desc';

  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;
}
