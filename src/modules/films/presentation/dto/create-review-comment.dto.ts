import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateReviewCommentDto {
  @ApiProperty({
    example: 'Отличный разбор, полностью согласен.',
    description: 'Comment text',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({
    example: '7d9a5a88-77ca-4fe2-a07f-a488ce78c688',
    required: false,
    nullable: true,
    description: 'Parent comment id for reply',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string | null;
}
