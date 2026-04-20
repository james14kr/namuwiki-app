import { api } from "@/utils";
import axios from "axios";

// 메인피드 목록 조회 axios
export const getListMain1 = async ()=>{
  try{
    const response = await api.get(
      `/sensorActuator/latest`, {params: {}}
    )
    return response;
  } catch(e){
    console.log("메인피드 목록 조회 axios 오류", e)
  }
}