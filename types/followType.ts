export interface FollowItem{
  farmerEmail : string;
  farmerNickname : string;
  farmerRole : string;
  farmerProfileImg?: string;
}

export interface FollowerItem{
  followerEmail: string;
  farmerEmail: string;
  followerNickname: string;
}