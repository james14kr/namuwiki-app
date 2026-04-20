export interface CarInfo {
  modelName: string;
  price: number;
  manufacturer: string;
  no?: number;
  modelNo: number;
}

export interface SalesInfo extends Pick<CarInfo, "modelName" | "price"> {
  no?: number;
  salesNo?: number;
  salesDate?: Date;
  buyerName: string;
  buyerPhone: string;
  color: string;
  modelNo: number;
}
export interface SalesRequestType {
  buyerName: string;
  buyerPhone: string;
  color: string;
  modelNo: number;
}
export type ModelInfo = Pick<CarInfo, "modelName" | "modelNo">;
