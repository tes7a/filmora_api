import { ApiProperty } from '@nestjs/swagger';
import { user_status } from '@prisma/client';

export class AdminUserResponseDto {
  @ApiProperty({ example: 'clz9u9r5f0000is43n8t34k9f' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  displayName: string;

  @ApiProperty({
    enum: user_status,
    example: user_status.active,
  })
  status: user_status;

  @ApiProperty({ example: '2026-02-12T10:20:30.000Z', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ example: '2026-02-13T08:15:10.000Z', format: 'date-time' })
  updatedAt: Date;

  @ApiProperty({
    example: '2026-02-13T08:15:10.000Z',
    format: 'date-time',
    nullable: true,
  })
  lastLoginAt: Date | null;

  @ApiProperty({ type: [String], example: ['user'] })
  roles: string[];
}

export class PaginatedAdminUsersResponseDto {
  @ApiProperty({ type: [AdminUserResponseDto] })
  items: AdminUserResponseDto[];

  @ApiProperty({ example: 245 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;
}
