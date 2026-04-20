import { getMyDevices, unlinkDevice } from "@/api/device.api";
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useUnlinkDevice = (cropId : number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => unlinkDevice(cropId),
    onSuccess: () => {
      //센서 데이터 캐시 초기화 -> "연결된 기기 없음 " 표시
      queryClient.invalidateQueries({queryKey: ["sensorData", cropId]});
      //나의 기기 목록 갱신
      queryClient.invalidateQueries({queryKey: ["getMyDevices"]});
    }
  })
}