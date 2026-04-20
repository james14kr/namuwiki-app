import { deleteCrop } from "@/api/crop.api";
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useDeleteCrop = (farmId : number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn : (cropId : number) => deleteCrop(cropId),
    onSuccess: () => {
      //삭제 후 해당 농장의 농작물 목록 캐시 무효화 -> 목록 자동 갱신
      queryClient.invalidateQueries({queryKey: ["cropList", farmId]})
    }
  })
}