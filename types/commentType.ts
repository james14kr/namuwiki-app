export interface CommentRequest{
  postId: number;
  memEmail: string | null;
  content: string;
}

export interface CommentResponse{
  id: number;
  postId: number;
  memEmail: string;
  memNickname: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  memProfileImg : string;
  memRole : string;
}