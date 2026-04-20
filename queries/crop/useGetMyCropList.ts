import { getMyCropList } from "@/api/crop.api"
import { useQuery } from "@tanstack/react-query"

export const useGetMyCropList = (farmerEmail : string) => {
  return useQuery({
    queryKey : ["myCropList", farmerEmail],
    queryFn : () => getMyCropList(farmerEmail),
    enabled: !!farmerEmail,
  })
}