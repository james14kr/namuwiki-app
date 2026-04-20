
import type { CommentResponse, CommentRequest } from "@/types/commentType";
import { api } from "@/utils";

export const commentApi = {

  // 댓글 등록 api
  insertComment: async (dto:CommentRequest)=>{
    const {data} = await api.post("/comments", dto);
    return data;
  },

  // 게시글별 댓글 목록 조회 api
  selectComment: async (postId:number)=>{
    const{data} = await api.get<CommentResponse[]>(`/comments/${postId}`);
    return data;
  },

  // 댓글 수정 api
  updateComment : async (dto:CommentRequest & {id:number})=>{
    const{data} = await api.put(`/comments/${dto.id}`,dto);
    return data;
  },


  // 댓글 삭제 api
  deleteComment: async (id:number)=>{
    await api.delete(`/comments/${id}`);
  }


};