import type { CropRegisterData } from "@/types/cropType";
import { api } from "@/utils";

export const postCropRegister = async (data: CropRegisterData) => {
  const response = await api.post("/crop", data);
  return response.data;
}

export const getCropList = async (farmId : number) => {
  const response = await api.get("/crop", {params: {farmId}});
  return response.data;
}

//농작물 ID로 해당 농작물 삭제
export const deleteCrop = async (cropId : number) => {
  const response = await api.delete(`/crop/${cropId}`);
  return response.data;
}

//농장주 이메일로 본인의 전체 농작물 조회
export const getMyCropList = async (farmerEmail : string) => {
  const response = await api.get("/crop/my", {params : {farmerEmail}})
  return response.data;
}