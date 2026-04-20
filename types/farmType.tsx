
export interface FarmRegisterData {
  farmerEmail : string;
  farmName : string;
  farmAddr : string;
  farmDesc : string;
}

export interface FarmItem{
  farmId : number;
  farmerEmail : string;
  farmName : string;
  farmAddr : string;
  farmDesc : string;
  createDate : string;
}

export interface FarmDetail{
  farmId : number;
  farmerEmail : string;
  farmName : string;
  farmAddr : string;
  farmDesc : string;
  memName : string;
  memNickname : string;
  memTel : string;
  memProfileImg : string;
}