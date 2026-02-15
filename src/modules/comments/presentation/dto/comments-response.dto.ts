import { ApiProperty } from '@nestjs/swagger';

export class CommentUserResponseDto {
  @ApiProperty({ example: 'e17f30d4-cfe8-42c6-9689-cf68f998a3db' })
  id: string;

  @ApiProperty({ example: 'neo_fan' })
  displayName: string;
}

export class CommentResponseDto {
  @ApiProperty({ example: '7d9a5a88-77ca-4fe2-a07f-a488ce78c688' })
  commentId: string;

  @ApiProperty({ example: 'c31566bb-0fb5-4f44-b8ff-84b81d2647d2' })
  reviewId: string;

  @ApiProperty({ example: 'e17f30d4-cfe8-42c6-9689-cf68f998a3db' })
  userId: string;

  @ApiProperty({
    example: '04c42b3f-6486-4f6b-a7ef-f60a86577338',
    nullable: true,
  })
  parentId: string | null;

  @ApiProperty({ example: 'Отличный разбор, полностью согласен.' })
  body: string;

  @ApiProperty({ example: 'visible' })
  status: string;

  @ApiProperty({ example: '2026-02-14T12:00:00.000Z', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ example: '2026-02-14T12:30:00.000Z', format: 'date-time' })
  updatedAt: Date;

  @ApiProperty({ type: CommentUserResponseDto })
  user: CommentUserResponseDto;
}

export class CommentTreeResponseDto extends CommentResponseDto {
  @ApiProperty({ type: () => [CommentTreeResponseDto] })
  children: CommentTreeResponseDto[];
}
