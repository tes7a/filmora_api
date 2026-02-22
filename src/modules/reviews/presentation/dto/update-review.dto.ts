import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateReviewDto {
  @ApiProperty({
    example: 'Even better on second watch',
    description: 'Review title',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example:
      'The philosophical ideas hold up, and the action choreography still feels sharp.',
    description: 'Review body text',
  })
  @IsString()
  @IsNotEmpty()
  body: string;
}
