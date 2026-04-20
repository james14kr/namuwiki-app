import { getMyDevices } from "@/api/device.api"
import { useQuery } from "@tanstack/react-query"

export const useGetMyDevices = (farmerEmail : string) => {
  return useQuery({
    queryKey: ["myDevices", farmerEmail],
    queryFn: () => getMyDevices(farmerEmail),
    enabled: !!farmerEmail,
  })
} 