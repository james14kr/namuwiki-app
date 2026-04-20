import { getSensorDataByCropId } from '@/api/sensor.api'
import { useQuery } from '@tanstack/react-query'

export const useGetSensorData = (cropId : number) => {
  return useQuery({
    queryKey: ["sensorData", cropId],
    queryFn: () => getSensorDataByCropId(cropId),
    enabled: !!cropId,
    refetchInterval: 10000,
  })
}

export default useGetSensorData