import { postCreateDevice } from "@/api/device.api";
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const usePostDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deviceId : string) => postCreateDevice(deviceId),
    onSuccess : () => {
      queryClient.invalidateQueries({queryKey : ["allDevices"]});
    }
  })
}