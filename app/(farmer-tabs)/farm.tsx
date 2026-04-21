import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getUserEmail } from '@/utils/auth';
import { useGetMyFarmList } from '@/queries/farm/useGetMyFarmList';
import { FarmItem } from '@/types/farmType';

const Farm = () => {
  //1. farmerEmail 상태 선언
  const [farmerEmail, setFarmerEmail] = useState<string | null>(null);

  //2. 컴포넌트 마운트 시 이메일 불러오기
  useEffect(() => {
    getUserEmail().then((email) => {
      setFarmerEmail(email);
    });
  }, []);

  //3. 농장 목록 조회 흑
  const {data, isLoading} = useGetMyFarmList(farmerEmail ?? "");

  //4. 로딩 처리
  if(isLoading) return <Text>로딩 중...</Text>

  //5. 빈 데이터 처리
  if(!data||data.length === 0) return <Text>등록된 농장이 없습니다.</Text>

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.farmId.toString()}
      renderItem={({item}: {item: FarmItem}) => (
        <View>
          <Text>{item.farmName}</Text>
          <Text>{item.farmAddr}</Text>
        </View>
      )}  
    />
  )
}

export default Farm

const styles = StyleSheet.create({})