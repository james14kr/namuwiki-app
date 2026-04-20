import { postCropRegister } from '@/api/crop.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'


export const usePostCrop = () => {

  const queryClient = useQueryClient()
  return useMutation({
    mutationFn : postCropRegister,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey : ["cropList"]});
    },
  })
  
}

export default usePostCrop