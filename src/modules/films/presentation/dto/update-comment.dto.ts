import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({
    example: 'Обновил мнение после пересмотра.',
    description: 'Updated comment text',
  })
  @IsString()
  @IsNotEmpty()
  body: string;
}
