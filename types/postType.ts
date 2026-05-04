export interface PostRequest {
  title: string;
  content: string;
  memEmail: string | null;
  hashtags?: string;  
  category?: string;  
}

export interface PostResponse {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  memEmail: string;
  memNickname: string;
  memProfileImg : string;
  viewCount : number;
  commentCount : number;
  memRole : string;
  likeCount: number
  hashtags?: string;  
  category?: string;  
}

export interface PostUpdateRequest {
  id: number;
  title: string;
  content: string;
  memEmail: string;
}

export interface PostLikeResponse {
  likeCount: number;
  liked: boolean;
}