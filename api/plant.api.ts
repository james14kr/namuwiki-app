import type { PlantIdentifyRes } from "@/types/namuType";
import { fileApi } from "@/utils";

export const identifyPlant = async (
  images: File[]
): Promise<PlantIdentifyRes> => {
  const formData = new FormData();
  images.forEach((file) => formData.append("images", file));

  const result = await fileApi.post<PlantIdentifyRes>(
    "/plant/identify",
    formData
  );
  return result.data;
};
