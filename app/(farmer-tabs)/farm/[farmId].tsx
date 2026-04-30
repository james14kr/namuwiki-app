import { Alert, FlatList, Pressable, StyleSheet, Text, View, ImageBackground, Image, ActivityIndicator } from 'react-native'
import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useGetFarmDetail } from '@/queries/farm/useGetFarmDetail';
import { useGetCropList } from '@/queries/crop/useGetCropList';
import { useDeleteFarm } from '@/queries/farm/useDeleteFarm';
import { useDeleteCrop } from '@/queries/farm/useDeleteCrop';
import { CropItem } from '@/types/cropType';
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context';

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
      '소속 농작물의 기기를 모두 해제한 후 삭제할 수 있습니다. 삭제하시겠습니까?',
      [
        {text: '취소', style: 'cancel'},
        {
          text: '삭제', 
          style: 'destructive',
          onPress: () => {
            deleteFarm(numericFarmId, {
            onSuccess: () => router.back(),
            onError: () => Alert.alert('삭제 실패', '기기가 연결된 농작물이 있습니다. 먼저 기기를 해제해주세요')
          })
        }}
      ]
    )
  }

  if(farmLoading || cropLoading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f6f0' }}>
      <ActivityIndicator size="large" color="#6A9469" style={{ marginTop: 100 }} />
    </SafeAreaView>
  )

  return (
    <SafeAreaView style={{flex:1 , backgroundColor: '#f4f6f0'}}>
      <FlatList
        style={styles.container}
        data={cropList}
        numColumns={2}
        columnWrapperStyle={styles.cropRow}
        keyExtractor={(item) => item.cropId.toString()}
  
        ListHeaderComponent={
          <>
            {/* 상단 헤더 */}
            <View style={styles.topHeader}>
              <Text style={styles.logo}>🌿 NamuWiki Farm</Text>
              <Pressable onPress={handleDeleteFarm}>
                <Text style={styles.deleteBtnText}>🗑 농장 삭제</Text>
              </Pressable>
            </View>
  
            {/* 농장 배너 */}
            {farmDetail?.farmImg ? (
              <ImageBackground
                source={{ uri: farmDetail.farmImg }}
                style={styles.banner}
                resizeMode="cover"
              >
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerFarmName}>{farmDetail?.farmName}</Text>
                  <View style={styles.bannerAddrRow}>
                    <Ionicons name="location-outline" size={13} color="#fff" />
                    <Text style={styles.bannerAddr}>{farmDetail?.farmAddr}</Text>
                  </View>
                </View>
              </ImageBackground>
            ) : (
              <View style={styles.banner}>
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerFarmName}>{farmDetail?.farmName}</Text>
                  <View style={styles.bannerAddrRow}>
                    <Ionicons name="location-outline" size={13} color="#fff" />
                    <Text style={styles.bannerAddr}>{farmDetail?.farmAddr}</Text>
                  </View>
                </View>
              </View>
            )}
  
            {/* 농장 소개 카드 */}
            <View style={styles.introCard}>
              <Text style={styles.introTitle}>농장 소개</Text>
              <Text style={styles.introDesc}>{farmDetail?.farmDesc}</Text>
            </View>
  
            {/* 농작물 목록 헤더 */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🌱 농작물 목록</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>총 {cropList?.length}개 품목</Text>
              </View>
            </View>
          </>
        }
  
        renderItem={({item}: {item: CropItem}) => (
          <Pressable
            style={styles.cropCard}
            onPress={() => router.push({
              pathname: '/(farmer-tabs)/farm/sensor',
              params: {cropId: item.cropId}
            })}
          >
            {item.cropImg ? (
              <Image source={{uri: item.cropImg}} style={styles.cropImgBox} />
            ) : (
              <View style={styles.cropImgBox}>
                <Text style={{fontSize:28}}>🌿</Text>
              </View>
            )}
            <Text style={styles.cropName}>{item.cropName}</Text>
            <Text style={styles.cropPrice}>{item.cropPrice.toLocaleString()}원</Text>
            <Pressable onPress={() => {
              Alert.alert(
                '농작물 삭제',
                '농작물을 삭제하려면 연결된 기기를 먼저 해제해야 합니다. 기기를 삭제하시겠습니까?',
                [
                  {text: '취소', style: 'cancel'},
                  {
                    text: '삭제',
                    style: 'destructive',
                    onPress: () => {
                      deleteCrop(item.cropId, {
                        onError: () => Alert.alert('삭제 실패', '연결된 기기가 있습니다. 먼저 기기를 해제해주세요')
                      })
                    }
                  }
                ]
              )
            }}>
              <Text style={styles.cropDeleteText}>삭제</Text>
            </Pressable>
          </Pressable>
        )}
  
        ListFooterComponent={
          <Pressable
            style={styles.registerBtn}
            onPress={() => router.push({
              pathname: '/(farmer-tabs)/farm/cropRegister',
              params: {farmId: numericFarmId}
            })}
          >
            <Text style={styles.registerBtnText}>농작물 등록</Text>
          </Pressable>
        }
      />
    </SafeAreaView>
  )
}

export default FarmDetail

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f0',
  },

  // 상단 헤더
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#f4f6f0',
  },
  logo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C4A2C',
  },
  deleteBtnText: {
    color: '#ff4444',
    fontSize: 13,
    fontWeight: '600',
  },

  // 농장 배너
  banner: {
    height: 200,
    backgroundColor: '#6A9469',
    justifyContent: 'flex-end',
  },
  bannerOverlay: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  bannerFarmName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  bannerAddrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bannerAddr: {
    fontSize: 13,
    color: '#eee',
  },

  // 농장 소개 카드
  introCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  introTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C4A2C',
    marginBottom: 8,
  },
  introDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },

  // 농작물 섹션 헤더
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2C4A2C',
  },
  countBadge: {
    backgroundColor: '#e8f5e9',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: {
    fontSize: 12,
    color: '#6A9469',
    fontWeight: '600',
  },

  // 농작물 그리드
  cropRow: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 10,
  },
  cropCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cropImgBox: {
    width: 60,
    height: 60,
    backgroundColor: '#f0f7f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden', 
  },
  cropName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C4A2C',
    marginBottom: 4,
    textAlign: 'center',
  },
  cropPrice: {
    fontSize: 12,
    color: '#6A9469',
    marginBottom: 8,
  },
  cropDeleteText: {
    color: '#ff4444',
    fontSize: 12,
    fontWeight: '600',
  },

  // 농작물 등록 버튼
  registerBtn: {
    backgroundColor: '#6A9469',
    margin: 16,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  registerBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})