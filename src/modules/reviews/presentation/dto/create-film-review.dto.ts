import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateFilmReviewDto {
  @ApiProperty({
    example: 'A surprisingly thoughtful sci-fi classic',
    description: 'Review title',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example:
      'Strong pacing, iconic visuals, and still relevant ideas about reality and control.',
    description: 'Review body text',
  })
  @IsString()
  @IsNotEmpty()
  body: string;
}
