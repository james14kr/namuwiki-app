import { deleteFollow, getFollowerList, getFollowList, postFollow } from "@/api/follow.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

//팔로우
export const usePostFollow = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn : (data: {followerEmail : string; farmerEmail : string}) => 
      postFollow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['followList']})
    }
  })
}

//언팔로우
export const useDeleteFollow = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn : (data : {followerEmail : string; farmerEmail : string}) => 
      deleteFollow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['followList']})
    }
  })
}

//팔로우 목록 조회
export const useGetFollowList = (followerEmail : string) => {
  return useQuery({
    queryKey : ["followList", followerEmail],
    queryFn : () => getFollowList(followerEmail),
    enabled : !!followerEmail,
  })
}

//팔로워 목록 조회
export const useGetFollowerList = (farmerEmail : string) => {
  return useQuery({
    queryKey : ["followerList", farmerEmail],
    queryFn : () => getFollowerList(farmerEmail),
    enabled : !!farmerEmail,
  })
}