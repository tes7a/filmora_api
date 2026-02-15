import { ApiProperty } from '@nestjs/swagger';

export class CreatedFilmReviewResponseDto {
  @ApiProperty({ example: 'c31566bb-0fb5-4f44-b8ff-84b81d2647d2' })
  reviewId: string;

  @ApiProperty({ example: 'a6d4ec80-1298-4fd3-87df-1785f4311845' })
  filmId: string;

  @ApiProperty({ example: 'e17f30d4-cfe8-42c6-9689-cf68f998a3db' })
  userId: string;

  @ApiProperty({ example: '4e51ad6a-20e3-4fca-b244-0f8ede6a2f88' })
  currentVersionId: string;

  @ApiProperty({ example: 1 })
  versionNumber: number;

  @ApiProperty({ example: 'A surprisingly thoughtful sci-fi classic' })
  title: string;

  @ApiProperty({
    example:
      'Strong pacing, iconic visuals, and still relevant ideas about reality and control.',
  })
  body: string;

  @ApiProperty({ example: '2026-02-14T12:00:00.000Z', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ example: '2026-02-14T12:00:00.000Z', format: 'date-time' })
  updatedAt: Date;
}

export class FilmReviewUserResponseDto {
  @ApiProperty({ example: 'e17f30d4-cfe8-42c6-9689-cf68f998a3db' })
  id: string;

  @ApiProperty({ example: 'neo_fan' })
  displayName: string;
}

export class FilmReviewVersionResponseDto {
  @ApiProperty({ example: '4e51ad6a-20e3-4fca-b244-0f8ede6a2f88' })
  id: string;

  @ApiProperty({ example: 1 })
  versionNumber: number;

  @ApiProperty({ example: 'A surprisingly thoughtful sci-fi classic' })
  title: string;

  @ApiProperty({
    example:
      'Strong pacing, iconic visuals, and still relevant ideas about reality and control.',
  })
  body: string;

  @ApiProperty({ example: '2026-02-14T12:00:00.000Z', format: 'date-time' })
  createdAt: Date;
}

export class FilmReviewResponseDto {
  @ApiProperty({ example: 'c31566bb-0fb5-4f44-b8ff-84b81d2647d2' })
  reviewId: string;

  @ApiProperty({ example: 'visible' })
  status: string;

  @ApiProperty({ example: '2026-02-14T12:00:00.000Z', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: FilmReviewUserResponseDto })
  user: FilmReviewUserResponseDto;

  @ApiProperty({ type: FilmReviewVersionResponseDto, nullable: true })
  currentVersion: FilmReviewVersionResponseDto | null;
}

export class UpdatedReviewResponseDto {
  @ApiProperty({ example: 'c31566bb-0fb5-4f44-b8ff-84b81d2647d2' })
  reviewId: string;

  @ApiProperty({ example: 'visible' })
  status: string;

  @ApiProperty({ example: '2026-02-14T12:00:00.000Z', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ example: '2026-02-14T12:30:00.000Z', format: 'date-time' })
  updatedAt: Date;

  @ApiProperty({ type: FilmReviewVersionResponseDto })
  currentVersion: FilmReviewVersionResponseDto;
}
