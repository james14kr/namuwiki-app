import { getFarmList } from '@/api/farm.api'
import { useQuery } from '@tanstack/react-query'
import React from 'react'

export const useGetFarmList = () => {
  return useQuery({
    queryKey : ["farmList"],
    queryFn : getFarmList,
  });
};