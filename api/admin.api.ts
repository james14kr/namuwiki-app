import { api } from "@/utils";

/**
 * 전체 사용자 조회
 * @returns
 */
export const selectFarmerList = async () => {
  try {
    const response = await api.get("/authes");
    return response.data;
  } catch (e) {
    console.log("인증번호 가진 농장주 조회 중 오류 발생", e);
    throw e;
  }
};

/**
 * 미등록 농장주count 조회
 * @returns 
 */
export const selectUnregFarmerCount = async () => {
  try {
    const response = await api.get("/authes/un-reg");
    return response.data;
  } catch (e) {
    console.log("미등록 농장주 조회 중 오류 발생", e);
    throw e;
  }
};
