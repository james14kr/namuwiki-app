import { getMyFarmList } from "@/api/farm.api"
import { useQuery } from "@tanstack/react-query"

export const useGetMyFarmList = (farmerEmail : string) => {
  return useQuery({
    queryKey : ["myFarmList", farmerEmail],
    queryFn : () => getMyFarmList(farmerEmail),
    enabled : !!farmerEmail,
    
  })
}