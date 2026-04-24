import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useGetFarmDetail } from '@/queries/farm/useGetFarmDetail';
import { useGetCropList } from '@/queries/crop/useGetCropList';
import { useDeleteFarm } from '@/queries/farm/useDeleteFarm';
import { useDeleteCrop } from '@/queries/farm/useDeleteCrop';
import { CropItem } from '@/types/cropType';

const FarmDetail = () => {

  const{farmId} = useLocalSearchParams();
  const numericFarmId = Number(farmId); //string -> number로 변환

  const router = useRouter()
  const{data: farmDetail, isLoading: farmLoading} = useGetFarmDetail(numericFarmId)
  const{data: cropList, isLoading: cropLoading} = useGetCropList(numericFarmId)
  const{mutate: deleteFarm} = useDeleteFarm()
  const{mutate: deleteCrop} = useDeleteCrop(numericFarmId)

  const handleDeleteFarm = () => {
    Alert.alert(
      '농장 삭제',
      '농장을 삭제하면 소속 농작물도 모두 삭제됩니다. 삭제하시겠습니까?',
      [
        {text: '취소', style: 'cancel'},
        {text: '삭제', style: 'destructive', onPress: () => {
          deleteFarm(numericFarmId, {
            onSuccess: () => router.back()
          })
        }}
      ]
    )
  }

  if(farmLoading || cropLoading) return <Text>로딩 중...</Text>

  return (
    <View style={styles.container}>
      
      {/* 농장 정보 */}
      <Text style={styles.farmName}>{farmDetail?.farmName}</Text>
      <Text style={styles.farmAddr}>{farmDetail?.farmAddr}</Text>
      <Text style={styles.farmDesc}>{farmDetail?.farmDesc}</Text>

      <Pressable style={styles.deleteBtn} onPress={handleDeleteFarm}>
        <Text style={styles.deleteBtnText}>농장 삭제</Text>
      </Pressable>

      {/* 농작물 목록 */}
      <Text style={styles.sectionTitle}>🌱 농작물 목록</Text>

      <FlatList
        data={cropList}
        keyExtractor={(item) => item.cropId.toString()}
        renderItem={({item}: {item: CropItem}) => (
          <View style={styles.cropCard}>
            <Pressable
              onPress={() => router.push({
                pathname: '/(farmer-tabs)/farm/sensor',
                params: {cropId: item.cropId}
              })}
            >
              <View>
                <Text style={styles.cropName}>{item.cropName}</Text>
                <Text style={styles.cropPrice}>{item.cropPrice.toLocaleString()}원</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => deleteCrop(item.cropId)}>
              <Text style={styles.cropDeleteText}>삭제</Text>
            </Pressable>
          </View>
        )}
      >
      </FlatList>

      <Pressable
        style={styles.registerBtn}
        onPress={() => router.push({
          pathname: '/(farmer-tabs)/farm/cropRegister',
          params: {farmId: numericFarmId}
        })}
      >
        <Text style={styles.registerBtnText}>농작물 등록</Text>
      </Pressable>

    </View>
  )
}

export default FarmDetail

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f0',
    paddingTop: 60,
    paddingHorizontal: 16,
  },

  // 농장 정보
  farmName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C4A2C',
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
    marginBottom: 16,
  },

  // 농장 삭제 버튼
  deleteBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#ff4444',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 24,
  },
  deleteBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },

  // 농작물 섹션
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C4A2C',
    marginBottom: 12,
  },

  // 농작물 카드
  cropCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#6A9469',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cropName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2C4A2C',
    marginBottom: 4,
  },
  cropPrice: {
    fontSize: 13,
    color: '#6A9469',
  },
  cropDeleteText: {
    color: '#ff4444',
    fontSize: 13,
    fontWeight: 'bold',
  },

  // 농작물 등록 버튼
  registerBtn: {
    backgroundColor: '#6A9469',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10
  },
  registerBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})