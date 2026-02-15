import type {
  CommentDto,
  CommentTreeDto,
  CreateReviewCommentParams,
  DeleteCommentParams,
  GetReviewCommentsParams,
  UpdateCommentParams,
} from '../dto';

export type {
  CommentDto,
  CommentTreeDto,
  CreateReviewCommentParams,
  DeleteCommentParams,
  GetReviewCommentsParams,
  UpdateCommentParams,
} from '../dto';

export const COMMENTS_REPOSITORY = Symbol('COMMENTS_REPOSITORY');

export interface CommentsRepository {
  createReviewComment(params: CreateReviewCommentParams): Promise<CommentDto | null>;
  getReviewComments(params: GetReviewCommentsParams): Promise<CommentTreeDto[] | null>;
  updateComment(params: UpdateCommentParams): Promise<CommentDto | null>;
  deleteComment(params: DeleteCommentParams): Promise<CommentDto | null>;
}
