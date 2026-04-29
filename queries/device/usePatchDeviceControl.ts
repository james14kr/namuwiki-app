import { patchDeviceControl } from "@/api/device.api"
import { DeviceControlData } from "@/types/namuType"
import { useMutation } from "@tanstack/react-query"

export const usePatchDeviceControl = () => {
  return useMutation({
    mutationFn: (data: DeviceControlData) => patchDeviceControl(data)
  })
}