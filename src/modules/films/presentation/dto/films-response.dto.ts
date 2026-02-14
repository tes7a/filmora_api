import { ApiProperty } from '@nestjs/swagger';

export class FilmGenreResponseDto {
  @ApiProperty({ example: 'd2c5d2d0-03da-4a5a-8a7b-0578e0e1f073' })
  id: string;

  @ApiProperty({ example: 'Sci-Fi' })
  name: string;

  @ApiProperty({ example: 'sci-fi' })
  slug: string;
}

export class FilmListItemResponseDto {
  @ApiProperty({ example: 'a6d4ec80-1298-4fd3-87df-1785f4311845' })
  id: string;

  @ApiProperty({ example: 'The Matrix' })
  title: string;

  @ApiProperty({ example: 'The Matrix' })
  originalTitle: string;

  @ApiProperty({ example: 1999 })
  releaseYear: number;

  @ApiProperty({ example: 136 })
  durationMin: number;

  @ApiProperty({ example: 'R', nullable: true })
  ageRating: string | null;

  @ApiProperty({ example: 8.7 })
  averageRating: number;

  @ApiProperty({ example: 124563 })
  ratingsCount: number;

  @ApiProperty({ example: '2026-01-11T18:30:45.123Z', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: [FilmGenreResponseDto] })
  genres: FilmGenreResponseDto[];
}

export class PaginatedFilmsResponseDto {
  @ApiProperty({ type: [FilmListItemResponseDto] })
  items: FilmListItemResponseDto[];

  @ApiProperty({ example: 342 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;
}

export class UpdateFilmRatingResponseDto {
  @ApiProperty({ example: 'a6d4ec80-1298-4fd3-87df-1785f4311845' })
  filmId: string;

  @ApiProperty({ example: 8 })
  userScore: number;

  @ApiProperty({ example: 8.5 })
  averageRating: number;

  @ApiProperty({ example: 1024 })
  ratingsCount: number;
}
