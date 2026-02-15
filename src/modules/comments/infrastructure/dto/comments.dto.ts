export interface CommentDto {
  commentId: string;
  reviewId: string;
  userId: string;
  parentId: string | null;
  body: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    displayName: string;
  };
}

export interface CommentTreeDto extends CommentDto {
  children: CommentTreeDto[];
}

export interface CreateReviewCommentParams {
  reviewId: string;
  userId: string;
  body: string;
  parentId?: string | null;
}

export interface GetReviewCommentsParams {
  reviewId: string;
}

export interface UpdateCommentParams {
  commentId: string;
  userId: string;
  body: string;
}

export interface DeleteCommentParams {
  commentId: string;
  userId: string;
}
