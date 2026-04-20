import type { DeviceRegisterData } from "@/types/deviceType";
import { api } from "@/utils"

//관리자: 기기 ID 생성
export const postCreateDevice = async (deviceId : string) => {
  const response = await api.post(`/device/admin?deviceId=${deviceId}`);
  return response.data;
}

//관리자 : 전체 기기 목록 조회
export const getAllDevices = async () => {
  const response = await api.get("/device/admin");
  return response.data;
}

//농장주: 기기 등록 (기기 -> 농작물 연결)
export const postDeviceRegister = async (data : DeviceRegisterData) => {
  const response = await api.post("/device/register", data);
  return response.data;
}

//농장주: 나의 기기 목록 조회
export const getMyDevices = async (farmerEmail : string) => {
  const response = await api.get(`/device/my?farmerEmail=${farmerEmail}`);
  return response.data;
}

//농장주: 기기 연결 해제
export const unlinkDevice = async(cropId : number) => {
  const response = await api.patch(`/device/unlink`, null, {params: {cropId}})
  return response.data;
}