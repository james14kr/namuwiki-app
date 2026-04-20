import { commentApi } from "@/api/comment.api";
import type { CommentRequest } from "@/types/commentType";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

    


// 쿼리 키
const commentKeys = {
  byPostId:(postId:number)=>["comments", postId],
};


// 댓글 등록
export const useInsertComment = (postId:number)=>{
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn : (dto : CommentRequest)=>commentApi.insertComment(dto),
    onSuccess : ()=>{
      queryClient.invalidateQueries({queryKey : commentKeys.byPostId(postId)});
    },
    onError : (e)=>{
      console.log(e.message);
    }
  });
};


// 게시글별 댓글 목록 조회
export const useGetComments = (postId:number)=>{
  return useQuery({
    queryKey : commentKeys.byPostId(postId),
    queryFn : ()=>commentApi.selectComment(postId),
  });
};



// 댓글 수정
export const useUpdateComment = (postId:number)=>{
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn : (dto: CommentRequest & {id:number})=>commentApi.updateComment(dto),
    onSuccess : ()=>{
      queryClient.invalidateQueries({queryKey : commentKeys.byPostId(postId)});
    },
    onError : (e)=>{
      console.log(e.message);
    },

  });
};

// 댓글 삭제
export const useDeleteComment = (postId:number)=>{
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id:number)=>commentApi.deleteComment(id),
    onSuccess:()=>{
      queryClient.invalidateQueries({queryKey:commentKeys.byPostId(postId)});
    },
    onError:(e)=>{
      console.log(e.message);
    }
  });
};