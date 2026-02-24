import { ApiProperty } from '@nestjs/swagger';

export class UserListItemResponseDto {
  @ApiProperty({ example: 'df4f311b-a1ca-4fc0-a799-4b2720d7ecf1' })
  id: string;

  @ApiProperty({ example: 'f04f311b-a1ca-4fc0-a799-4b2720d7ecf2' })
  filmId: string;

  @ApiProperty({ example: 1, nullable: true })
  position: number | null;

  @ApiProperty({ example: 'Must rewatch', nullable: true })
  note: string | null;

  @ApiProperty({ example: '2026-02-24T10:00:00.000Z', format: 'date-time' })
  createdAt: Date;
}

export class UserListResponseDto {
  @ApiProperty({ example: 'de4f311b-a1ca-4fc0-a799-4b2720d7ecf0' })
  id: string;

  @ApiProperty({ example: 'Top Sci-Fi' })
  name: string;

  @ApiProperty({ example: 'custom' })
  type: string;

  @ApiProperty({ example: false })
  isPublic: boolean;

  @ApiProperty({ example: '2026-02-24T10:00:00.000Z', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ example: '2026-02-24T11:00:00.000Z', format: 'date-time' })
  updatedAt: Date;

  @ApiProperty({ type: [UserListItemResponseDto] })
  items: UserListItemResponseDto[];
}
