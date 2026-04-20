export interface PlantResult {
  key: number;
  score: number;
  scientificName: string;
  genus: string;
  korGenusNm: string | null;
  family: string;
  korFamilyNm: string | null;
  commonNames: string[];
  korName: string | null;
}

export interface PlantIdentifyRes {
  bestMatch: string;
  bestMatchKey: number;
  results: PlantResult[];
}

export interface SensorData {
  label: string;
  value: string;
}

export interface SensorActuatorData {
  crops: string;
  deviceId: string;
  createDate: string;
  tempC: number;
  humidity: number;
  soilMoistureValue: number;
  ldrValue: number;
  fanStatus: number;
  ledStatus: number;
  pumpStatus: number;
  tempMin: number;
  tempMax: number;
  soilMin: number;
  soilMax: number;
  luxMin: number;
  luxMax: number;
}

export type FeedCategory = "농업인" | "소비자";

export interface FeedPost {
  id: number;
  author: string;
  avatarColor: string;
  crop: string;
  timeAgo: string;
  badge: { label: string; variant: "success" | "secondary" };
  content: string;
  sensors: SensorData[];
  barCount: number;
  activeBarCount: number;
  tags: string[];
  likes: number;
  comments: number;
  category: FeedCategory;
}

export interface SensorHistory{
  createDate: string;
  tempC: number;
  humidity: number;
  soilMoistureValue : number;
  ldrValue: number;
}
