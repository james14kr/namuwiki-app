import { useMutation } from "@tanstack/react-query";
import { identifyPlant } from "@/api/plant.api";

export const useIdentifyPlant = () => {
  return useMutation({
    mutationFn: (images: File[]) => identifyPlant(images),
  });
};
