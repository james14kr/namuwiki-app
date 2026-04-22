import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getUserEmail } from '@/utils/auth';
import { useGetMyFarmList } from '@/queries/farm/useGetMyFarmList';
import { FarmItem } from '@/types/farmType';
import { useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react'

const Farm = () => {

  const router = useRouter()

  //1. farmerEmail 상태 선언
  const [farmerEmail, setFarmerEmail] = useState<string | null>(null);

  //2. 컴포넌트 마운트 시 이메일 불러오기
  useEffect(() => {
    getUserEmail().then((email) => {
      setFarmerEmail(email);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      refetch()
    },[])
  )

  //3. 농장 목록 조회 흑
  const {data, isLoading, refetch} = useGetMyFarmList(farmerEmail ?? "");

  //4. 로딩 처리
  if(isLoading) return <Text>로딩 중...</Text>

  //5. 빈 데이터 처리
  if(!data||data.length === 0) return <Text>등록된 농장이 없습니다.</Text>

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{padding: 16}}
        ItemSeparatorComponent={() => <View style={{height: 12}}/>}
        data={data}
        keyExtractor={(item) => item.farmId.toString()}
        renderItem={({item}: {item: FarmItem}) => (
          <View style={styles.card}>
            <Text style={styles.farmName}>🌾{item.farmName}</Text>
            <Text style={styles.farmAddr}>{item.farmAddr}</Text>
            <Text style={styles.farmDesc}>{item.farmDesc}</Text>
          </View>
        )}  
      />

      <Pressable
        style={({pressed}) => [styles.regBtn, pressed && styles.pressed]}

        onPress={e => router.push('../farm/register')}
      >
        <AntDesign name="plus" size={24} color="white" />
      </Pressable>
    </View>
  )
}

export default Farm

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f0',  // 연한 녹색 배경
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderBottomWidth: 4,
    borderBottomColor: '#4CAF50',  // 초록 포인트 라인
    // 그림자
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  farmName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d4a1e',  // 짙은 녹색
    marginBottom: 6,
  },
  farmAddr: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  farmDesc: {
    fontSize: 13,
    color: '#999',
  },
  regBtn: {
    position: 'absolute',
    width: 50,
    height: 50,
    bottom: 30,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pressed: {
    opacity: 0.8
  }
})