import { type PostLikeResponse, type PostRequest, type PostResponse, type PostUpdateRequest } from "@/types/postType";
import { api } from "@/utils";

export const postApi = {
  create: async (dto: PostRequest) => {
    const { data } = await api.post("/posts", dto);
    return data;
  },

  getOne: async (id: string) => {
    const { data } = await api.get<PostResponse>(`/posts/${id}`);
    return data;
  },

  getAll: async () => {
    const { data } = await api.get<PostResponse[]>("/posts");
    return data;
  },
  // 상세보기 삭제 axios
  deleteDetail1: async (id: number) => {
    await api.delete(`/posts/${id}`);
  },
  // 상세보기 수정 axios
  update: async (dto: PostUpdateRequest) => {
    const { data } = await api.put(`/posts/${dto.id}`, dto);
    return data;
  },

  // 좋아요 토글 axios
  toggleLike: async (postId:number, memEmail:string)=>{
    const {data} = await api.post(`/likes`, {postId,memEmail});
    return data;
  },

  // 좋아요 상태 조회 axios
  getLikeStatus: async (postId:number, memEmail:string | null)=>{
    const {data} = await api.get<PostLikeResponse>(`/likes/${postId}`, {params:{memEmail}});
    return data;
  },

};
