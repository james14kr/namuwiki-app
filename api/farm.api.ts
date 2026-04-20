import type { FarmRegisterData } from "@/types/farmType";
import { api } from "@/utils";

export const postFarmRegister = async(data : FarmRegisterData) => {
  const response = await api.post("/farm", data)
  return response;
}

export const getFarmList = async () => {
  const response = await api.get("/farm");
  return response.data;
}

export const getFarmDetail = async (farmId : number) => {
  const response = await api.get(`/farm/${farmId}`)
  return response.data;
}

export const getMyFarmList = async (farmerEmail : string) => {
  const response = await api.get("/farm/my", {params : {farmerEmail}});
  return response.data;
}

//농장 삭제 API 호출
//farmId에 해당하는 농장과 소속 농장물을 모두 삭제
export const deleteFarm = async (farmId : number) => {
  const response = await api.delete(`/farm/${farmId}`);
  return response.data;
}