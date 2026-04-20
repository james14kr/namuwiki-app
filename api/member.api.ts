// member 관련 api 모음집!

import type { addAdminParam, MemberData } from "@/types/memberType";
import { api } from "@/utils";
import { data } from "react-router-dom";

/**
 *
 * @param joinData 회원가입 API 실행 함수
 * @returns
 */
export const postJoinData = async (joinData: object) => {
  try {
    const response = await api.post("/members", joinData);
    return response;
  } catch (e) {
    console.log("회원가입 api 오류", e);
    throw e;
  }
};

/**
 * 이메일 중복 조회 api
 *
 * @returns
 */
export const postEmail = async (memEmail: string) => {
  try {
    const response = await api.post("/members/memEmail", { memEmail });
    return response.data;
  } catch (e) {
    console.log("이메일 중복 조회 api 오류", e);
    throw e;
  }
};

/**
 * 닉네임 중복 조회 api
 * @param memNickname 닉네임
 * @returns
 */
export const postNickname = async (memNickname: string) => {
  try {
    const response = await api.post("/members/memNickname", { memNickname });
    return response.data;
  } catch (e) {
    console.log("닉네임 중복 조회 api 오류", e);
    throw e;
  }
};

/**
 * 로그인 - spring security에게 전달
 * @returns
 */
export const postLogin = async (loginData: object) => {
  try {
    const response = await api.post("/members/login", loginData);
    return response;
  } catch (e) {
    console.log("로그인 api 오류", e);
    throw e;
  }
};

/**
 *
 * @param authCode 인증번호
 * @returns
 */
export const postAuthCode = async (authCode: object) => {
  try {
    const response = await api.post("/authes/authCode", authCode);
    return response;
  } catch (e) {
    console.log("인증번호 생성 중 오류 발생", e);
    throw e;
  }
};

/**
 * 회원가입 시 인증번호 유효성검사
 * @returns
 */
export const postCheckFarmerAuth = async (authCode: object) => {
  try {
    const response = await api.post("/authes/check-auth", authCode);
    return response;
  } catch (e) {
    console.log("인증번호 유효성 검사 시 오류 발생", e);
    throw e;
  }
};

/**
 * 전체 사용자 조회
 * @returns
 */
export const selectMemberList = async () => {
  try {
    const response = await api.get("/members/member-list");
    return response.data;
  } catch (e) {
    console.log("전체 사용자 조회 중 오류 발생", e);
    throw e;
  }
};

/**
 * 사용자추가 버튼 클릭 시 관리자 추가
 * @param addAdmin 사용자 추가 할 관리자 데이터
 * @returns
 */
export const postAddAdmin = async (addAdmin: addAdminParam) => {
  try {
    const response = await api.post("/members/add-admin", addAdmin);
    return response;
  } catch (e) {
    console.log("관리자 추가 시 오류 발생", e);
    throw e;
  }
};

/**
 * 회원 삭제
 * @param memEmail 이메일
 * @returns
 */
export const delMember = async (memEmail: string) => {
  try {
    const response = await api.delete("/members/delete-member", {
      params: { memEmail },
    });
    return response;
  } catch (e) {
    console.log("회원 삭제 api 실행 중 오류 발생", e);
    throw e;
  }
};

/**
 * 권한 수정
 * @param updateRole 변경된 권한데이터
 * @returns 
 */
export const updateRole = async (updateRole : object) => {
  try {
    const response = await api.put("/members/update-role", updateRole);
    return response;
  } catch (e) {
    console.log("권한 변경 api 실행 중 오류 발생", e);
    throw e;
  }
};

/**
 * 선택한 권한 정보 조회
 * @param memRole 선택한 권한 데이터
 * @returns 
 */
export const fetchMembers = async (memRole : string) => {
  try{
    const params = memRole ? {memRole} : {};
    return api.get("/members/admin", {params});
  }catch(e){
    console.log("선택한 권한에 맞는 데이터 조회 중 오류 발생", e);
    throw e;
  }
};
