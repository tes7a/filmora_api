import { ApiProperty } from '@nestjs/swagger';

export class PersonListItemResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() fullName: string;
  @ApiProperty() slug: string;
  @ApiProperty({ nullable: true }) birthDate: Date | null;
  @ApiProperty({ nullable: true }) deathDate: Date | null;
  @ApiProperty({ nullable: true }) bio: string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class PersonFilmRoleResponseDto {
  @ApiProperty() filmId: string;
  @ApiProperty() title: string;
  @ApiProperty() originalTitle: string;
  @ApiProperty() releaseYear: number;
  @ApiProperty() roleType: string;
  @ApiProperty({ nullable: true }) characterName: string | null;
  @ApiProperty({ nullable: true }) billingOrder: number | null;
}

export class PersonDetailsResponseDto extends PersonListItemResponseDto {
  @ApiProperty({ type: [PersonFilmRoleResponseDto] })
  films: PersonFilmRoleResponseDto[];
}

export class PaginatedPersonsResponseDto {
  @ApiProperty({ type: [PersonListItemResponseDto] })
  items: PersonListItemResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;
}
