import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { postApi } from "@/api/post.api";
import type { PostRequest, PostUpdateRequest } from "@/types/postType";
import { queryKeys } from "@/queryKeys";
import type { PostLikeResponse } from "@/types/postType";


// Get은 useQuery, 나머지는 useMutation
export const useGetPosts = () => {
  return useQuery({
    queryKey: queryKeys.post.all,
    queryFn: postApi.getAll,
  });
};

export const useGetPost = (id: string) => {
  return useQuery({
    queryKey: queryKeys.post.detail(id),
    queryFn: () => postApi.getOne(id),
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: PostRequest) => postApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.post.all });
    },
  });
};

// 게시글 수정
export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: PostUpdateRequest) => postApi.update(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.post.all });
    },
    onError: (e) => {
      console.log(e.message);
    },
  });
};

export const useDeleteDetail1 = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => postApi.deleteDetail1(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.post.all });
    },
    onError: (e) => {
      console.log(e.message);
    },
  });
};


// 좋아요 상태 조회
export const useGetLikeStatus = (postId:number, memEmail:string | null)=>{
  return useQuery({
    queryKey: queryKeys.post.like(postId, memEmail),
    queryFn: ()=>postApi.getLikeStatus(postId,memEmail ?? ""),
    // 로그인 경우일때만
    enabled: !!memEmail, 
  });
};

// 좋아요 토글
export const useToggleLike = (postId:number, memEmail:string | null)=>{
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({postId, memEmail} : {postId:number; memEmail:string})=>
      postApi.toggleLike(postId,memEmail),
    onSuccess:()=>{
      queryClient.invalidateQueries({queryKey:queryKeys.post.like(postId, memEmail)});
    },
  });
};



