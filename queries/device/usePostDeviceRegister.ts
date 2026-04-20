import { postDeviceRegister } from "@/api/device.api";
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const usePostDeviceRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postDeviceRegister,
    onSuccess : () => {
      queryClient.invalidateQueries({queryKey: ["cropList"]});
    }
  })

}