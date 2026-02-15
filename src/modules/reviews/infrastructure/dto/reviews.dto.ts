export interface CreateFilmReviewParams {
  filmId: string;
  userId: string;
  title: string;
  body: string;
}

export interface CreatedFilmReviewDto {
  reviewId: string;
  filmId: string;
  userId: string;
  currentVersionId: string;
  versionNumber: number;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilmReviewDto {
  reviewId: string;
  status: string;
  createdAt: Date;
  user: {
    id: string;
    displayName: string;
  };
  currentVersion: {
    id: string;
    versionNumber: number;
    title: string;
    body: string;
    createdAt: Date;
  } | null;
}

export interface GetFilmReviewsParams {
  filmId: string;
}

export interface UpdateReviewParams {
  filmId: string;
  userId: string;
  title: string;
  body: string;
}

export interface UpdatedReviewDto {
  reviewId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  currentVersion: {
    id: string;
    versionNumber: number;
    title: string;
    body: string;
    createdAt: Date;
  };
}
