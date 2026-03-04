import { ApiProperty } from '@nestjs/swagger';
import {
  film_status,
  genre_status,
  person_status,
  tag_status,
} from '@prisma/client';

export class GenreResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() slug: string;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty({ enum: genre_status }) status: genre_status;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class PaginatedGenresResponseDto {
  @ApiProperty({ type: [GenreResponseDto] }) items: GenreResponseDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
}

export class TagResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() slug: string;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty({ enum: tag_status }) status: tag_status;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class PaginatedTagsResponseDto {
  @ApiProperty({ type: [TagResponseDto] }) items: TagResponseDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
}

export class CountryResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() code: string;
  @ApiProperty() name: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class PaginatedCountriesResponseDto {
  @ApiProperty({ type: [CountryResponseDto] }) items: CountryResponseDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
}

export class PersonResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() fullName: string;
  @ApiProperty() slug: string;
  @ApiProperty({ nullable: true }) birthDate: Date | null;
  @ApiProperty({ nullable: true }) deathDate: Date | null;
  @ApiProperty({ nullable: true }) bio: string | null;
  @ApiProperty({ enum: person_status }) status: person_status;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class PaginatedPersonsResponseDto {
  @ApiProperty({ type: [PersonResponseDto] }) items: PersonResponseDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
}

export class AdminFilmResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty() originalTitle: string;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty() releaseYear: number;
  @ApiProperty() durationMin: number;
  @ApiProperty({ nullable: true }) ageRating: string | null;
  @ApiProperty({ enum: film_status }) status: film_status;
  @ApiProperty() averageRating: number;
  @ApiProperty() ratingsCount: number;
  @ApiProperty() popularityScore: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class PaginatedAdminFilmsResponseDto {
  @ApiProperty({ type: [AdminFilmResponseDto] }) items: AdminFilmResponseDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
}

export class DeleteResponseDto {
  @ApiProperty({ example: true })
  deleted: true;
}
