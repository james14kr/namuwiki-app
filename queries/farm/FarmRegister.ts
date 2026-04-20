import { postFarmRegister } from "@/api/farm.api"
import type { FarmRegisterData } from "@/types/farmType"
import { useMutation } from "@tanstack/react-query"

export const usePostFarmRegister = () => {
  return useMutation({
    mutationFn: (param: FarmRegisterData) => postFarmRegister(param),
  });
}