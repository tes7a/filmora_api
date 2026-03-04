export interface ListItemDto {
  id: string;
  filmId: string;
  position: number | null;
  note: string | null;
  createdAt: Date;
}

export interface UserListDto {
  id: string;
  name: string;
  type: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  items: ListItemDto[];
}

export interface CreateCustomListParams {
  userId: string;
  name: string;
  isPublic?: boolean;
}

export interface AddFilmToListParams {
  userId: string;
  listId: string;
  filmId: string;
  position?: number | null;
  note?: string | null;
}

export interface RemoveFilmFromListParams {
  userId: string;
  listId: string;
  filmId: string;
}

export interface UpdateListParams {
  userId: string;
  listId: string;
  name?: string;
  isPublic?: boolean;
}
