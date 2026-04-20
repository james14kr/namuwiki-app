import { api } from "@/utils";

//팔로우
export const postFollow = async (data : {followerEmail : string; farmerEmail : string}) => {
  const response = await api.post("/follow", data);
  return response.data;
}

//언팔로우
export const deleteFollow = async (data : {followerEmail : string; farmerEmail : string}) => {
  const response = await api.delete("/follow", {data});
  return response.data;
}

//팔로우 목록 조회
export const getFollowList = async (followerEmail : string) => {
  const response = await api.get("/follow", {params : {followerEmail}});
  return response.data;
}

//팔로우 여부 확인
export const getCheckFollow = async (data : {followerEmail : string; farmerEmail : string}) => {
  const response = await api.get("/follow/check", {params : data})
  return response.data;
}

//팔로워 목록 조회
export const getFollowerList = async (farmerEmail : string) => {
  const response = await api.get("/follow/followers", {params : {farmerEmail}});
  return response.data;
}