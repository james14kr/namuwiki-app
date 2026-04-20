import { getSensorHistory } from "@/api/sensor.api"
import { useQuery } from "@tanstack/react-query"

export const useGetSensorHistory = (cropId: number, limit = 20, startDate?: string) => {
  return useQuery({
    queryKey: ["sensorHistory", cropId, startDate],
    queryFn: () => getSensorHistory(cropId, limit, startDate),
    enabled: !!cropId,
    refetchInterval: 60000
  })
}
