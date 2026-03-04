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
  pageSize: number;
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

export class MyFilmRatingResponseDto {
  @ApiProperty({ example: 'a6d4ec80-1298-4fd3-87df-1785f4311845' })
  filmId: string;

  @ApiProperty({
    example: 8,
    nullable: true,
    description: 'Current user rating for this film or null if not rated yet',
  })
  userScore: number | null;
}

export class FilmCountryResponseDto {
  @ApiProperty({ example: 'bfb6fd98-bf97-4996-b8e5-e08ce59477cf' })
  id: string;

  @ApiProperty({ example: 'US' })
  code: string;

  @ApiProperty({ example: 'United States' })
  name: string;
}

export class FilmTagResponseDto {
  @ApiProperty({ example: '12474e2e-2936-4a1d-a885-5fe1a74f4529' })
  id: string;

  @ApiProperty({ example: 'Cyberpunk' })
  name: string;

  @ApiProperty({ example: 'cyberpunk' })
  slug: string;
}

export class FilmPersonResponseDto {
  @ApiProperty({ example: '6edbb2e1-d2e1-40af-b3a5-30ba7293ecad' })
  personId: string;

  @ApiProperty({ example: 'Keanu Reeves' })
  fullName: string;

  @ApiProperty({ example: 'keanu-reeves' })
  slug: string;

  @ApiProperty({ example: 'actor' })
  roleType: string;

  @ApiProperty({ example: 'Neo', nullable: true })
  characterName: string | null;

  @ApiProperty({ example: 1, nullable: true })
  billingOrder: number | null;
}

export class FilmDetailsResponseDto {
  @ApiProperty({ example: 'a6d4ec80-1298-4fd3-87df-1785f4311845' })
  id: string;

  @ApiProperty({ example: 'The Matrix' })
  title: string;

  @ApiProperty({ example: 'The Matrix' })
  originalTitle: string;

  @ApiProperty({ example: 'A computer hacker learns about the true nature of reality.' })
  description: string | null;

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

  @ApiProperty({ type: [FilmGenreResponseDto] })
  genres: FilmGenreResponseDto[];

  @ApiProperty({ type: [FilmTagResponseDto] })
  tags: FilmTagResponseDto[];

  @ApiProperty({ type: [FilmCountryResponseDto] })
  countries: FilmCountryResponseDto[];

  @ApiProperty({ type: [FilmPersonResponseDto] })
  persons: FilmPersonResponseDto[];

  @ApiProperty({ example: '2026-01-11T18:30:45.123Z', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-11T18:30:45.123Z', format: 'date-time' })
  updatedAt: Date;
}

export class FilmFullResponseDto extends FilmDetailsResponseDto {
  @ApiProperty({ type: [FilmListItemResponseDto] })
  similarFilms: FilmListItemResponseDto[];

  @ApiProperty({ type: [FilmListItemResponseDto] })
  samePersonFilms: FilmListItemResponseDto[];
}

export class SimilarFilmResponseDto {
  @ApiProperty({ type: FilmListItemResponseDto })
  film: FilmListItemResponseDto;

  @ApiProperty({
    example: 'Shared genres: Action, Sci-Fi; shared tags: Cyberpunk',
  })
  reason: string;
}

export class PaginatedSimilarFilmsResponseDto {
  @ApiProperty({ type: [SimilarFilmResponseDto] })
  items: SimilarFilmResponseDto[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  pageSize: number;
}
