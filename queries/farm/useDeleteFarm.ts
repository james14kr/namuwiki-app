import { deleteFarm } from "@/api/farm.api";
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useDeleteFarm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (farmId : number) => deleteFarm(farmId),
    onSuccess: () => {
      //삭제 후 농장 목록 캐시 무효화 -> 목록이 자동으로 최신화됨
      queryClient.invalidateQueries({queryKey : ["myFarmList"]});
    }
  })
}