import { useMutation, useQuery } from "@tanstack/react-query";
import {
  delMember,
  fetchMembers,
  postAddAdmin,
  postAuthCode,
  postCheckFarmerAuth,
  postEmail,
  postJoinData,
  postLogin,
  postNickname,
  selectMemberList,
  updateRole,
} from "@/api/member.api";
import type {
  addAdminParam,
  joinData,
  loginData,
  MemberData,
} from "@/types/memberType";
import { queryKeys } from "@/queryKeys";

// export const useGetPosts = () => {
//   return useQuery({
//     queryKey: queryKeys.post.all,
//     queryFn: postApi.getAll,
//   });
// };

// 회원가입
export const usePostJoinData = () => {
  return useMutation({
    mutationFn: (param: joinData) => postJoinData(param),
  });
};

// 이메일 중복 조회, 이메일 찾기 조회
export const usePostEmail = () => {
  return useMutation({
    // 이메일을 전달
    mutationFn: (param: string) => postEmail(param),
  });
};

// 닉네임 중복 조회
export const usePostNickname = () => {
  return useMutation({
    // 닉네임 전달
    mutationFn: (param: string) => postNickname(param),
  });
};

// 로그인 - spring security에게 전달
export const usePostLogin = () => {
  return useMutation({
    mutationFn: (param: loginData) => postLogin(param),
  });
};

// 인증번호 생성
export const usePostAuthCode = () => {
  return useMutation({
    mutationFn: (param: object) => postAuthCode(param),
  });
};

// 인증번호 유효성검사
export const usePostCheckFarmerAuth = () => {
  return useMutation({
    mutationFn: (param: object) => postCheckFarmerAuth(param),
  });
};

// 전체 사용자 조회
export const useGetMemberList = () => {
  return useQuery({
    queryKey: ["members"],
    queryFn: selectMemberList,
  });
};

// 사용자 추가버큰 클릭 시 관리자 추가
export const usePostAddAdmin = () => {
  return useMutation({
    mutationFn: (param: addAdminParam) => postAddAdmin(param),
  });
};

// 회원 삭제
export const useDeleteMember = () => {
  return useMutation({
    mutationFn: (param: string) => delMember(param),
  });
};

// 권한 변경
export const useUpdateRole = () => {
  return useMutation({
    mutationFn: (param: object) => updateRole(param),
  });
};

// 선택한 권한 데이터 조회
export const useFetchMembers = () => {
  return useQuery({
    queryKey: ["members", selectedRole],
    queryFn: () => fetchMembers(selectedRole || undefined),
  });
};