import { getAllDevices } from "@/api/device.api"
import { useQuery } from "@tanstack/react-query"

export const useGetAllDevices = () => {
  return useQuery({
    queryKey : ["allDevices"],
    queryFn : getAllDevices,
  })
}