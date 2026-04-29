import type { SensorActuatorData, SensorHistory, ThresholdUpdateData } from "@/types/namuType";
import { api } from "@/utils";


//cropId로 최신 센서 데이터 조회
export const getSensorDataByCropId = async (cropId : number): Promise<SensorActuatorData | null> => {
  const response = await api.get(`/sensorActuator/latest/crop`, {params: {cropId}});
  return response.status === 204 ? null : response.data;
}

export const getSensorHistory = async (cropId: number, limit = 20, startDate?: string): Promise<SensorHistory[]> => {
  const response = await api.get(`/sensorActuator/history/crop`, {params: {cropId, limit, ...(startDate && {startDate})}});
  return response.data;
}

//임계값 수정
export const patchThreshold = async(data: ThresholdUpdateData) => {
  const response = await api.patch('/sensorActuator/threshold', data)
  return response.data
}