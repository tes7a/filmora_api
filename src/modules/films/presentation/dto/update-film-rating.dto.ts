import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class UpdateFilmRatingDto {
  @ApiProperty({
    example: 8,
    minimum: 1,
    maximum: 10,
    description: 'User rating score from 1 to 10',
  })
  @IsInt()
  @Min(1)
  @Max(10)
  score: number;
}
