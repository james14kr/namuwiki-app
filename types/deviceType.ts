//기기 생성(관리자)
export interface DeviceCreateData{
  deviceId : string;
}

//기기 등록 (농장주 - 기기 <--> 농작물 연결)
export interface DeviceRegisterData{
  deviceId : string;
  cropId : number;
  farmerEmail : string;
}

//기기 정보 (조회용)
export interface DeviceItem{
  deviceId : string;
  cropId : number | null;
  farmerEmail : string | null;
  isActive : number;
  registeredAt : string | null;
  createdAt : string;
  cropName : string | null;
  farmName : string | null;
}