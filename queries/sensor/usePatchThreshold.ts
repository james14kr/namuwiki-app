import { patchThreshold } from "@/api/sensor.api"
import { ThresholdUpdateData } from "@/types/namuType"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const usePatchThreshold = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ThresholdUpdateData) => patchThreshold(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['sensorData']})
    }
  })
}