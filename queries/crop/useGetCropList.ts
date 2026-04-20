import { getCropList } from "@/api/crop.api"
import { useQuery } from "@tanstack/react-query"

export const useGetCropList = (farmid : number) => {
  return useQuery({
    queryKey: ["cropList", farmid],
    queryFn: () => getCropList(farmid),
    enabled: !!farmid,
  })
}