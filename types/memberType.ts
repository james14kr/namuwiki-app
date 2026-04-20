export interface joinData {
  memEmail: string;
  memPw: string;
  memNickname: string;
  memName: string;
  memTel: string;
  memAdd: string;
  addDetail: string;
  memRole: string;
  farmerName: string;
  authCode: string;
}

export interface loginData {
  memEmail: string;
  memPw: string;
}

export interface memEmail {
  memEmail: string;
}

export interface authCode {
  authCode : string;
  memName: string;
  memTel: string;
}

export interface addAdminParam{
  memEmail: string;
  memPw: string;
}

export interface MemberData {
  memEmail: string;
  memName: string;
  memTel: string;
  memRole: "FARMER" | "USER" | "ADMIN";
  memJoinData: Date;
}

export interface MemInfoDTO {
  memEmail: string;
  memRole: string;
  memNickname: string;
  memName: string;
  memTel: string;
  memAdd: string;
  memJoinDate: string;
  memProfileImg: string;
}