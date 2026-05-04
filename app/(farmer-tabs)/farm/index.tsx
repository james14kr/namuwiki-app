import { FlatList, Pressable, StyleSheet, Text, View, Image, ActivityIndicator, Animated } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import { getUserEmail, getUserNickName } from '@/utils/auth';
import { useGetMyFarmList } from '@/queries/farm/useGetMyFarmList';
import { FarmItem } from '@/types/farmType';
import { useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context';

const Farm = () => {

  const router = useRouter()

  //1. farmerEmail 상태 선언
  const [farmerEmail, setFarmerEmail] = useState<string | null>(null);
  const [nickName, setNickname] = useState<string | null>(null);

  const waveAnim = useRef(new Animated.Value(0)).current
  const waveDrift1 = useRef(
    waveAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 18] })
  ).current
  const waveDrift2 = useRef(
    waveAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] })
  ).current
  const waveDrift3 = useRef(
    waveAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] })
  ).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 4500, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 4500, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [waveAnim])

  //2. 컴포넌트 마운트 시 이메일 불러오기
  useEffect(() => {
    getUserEmail().then((email) => {setFarmerEmail(email)});
    getUserNickName().then((name) => setNickname(name))
  }, []);

  useFocusEffect(
    useCallback(() => {
      refetch()
    },[])
  )

  //3. 농장 목록 조회 흑
  const {data, isLoading, refetch} = useGetMyFarmList(farmerEmail ?? "");

  //4. 로딩 처리
  if(isLoading) return(
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color="#6A9469" style={{marginTop: 100}}/>
    </SafeAreaView>
  )

  //5. 빈 데이터 처리
  if(!data || data.length === 0) return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>🌱 등록된 농장이 없습니다.</Text>
      <Text style={styles.emptySubText}>아래 + 버튼을 눌러 농장을 등록해보세요.</Text>
      <Pressable
        style={({pressed}) => [styles.regBtn, pressed && styles.pressed]}
        onPress={() => router.push('/(farmer-tabs)/farm/register')}
      >
        <AntDesign name="plus" size={24} color="white" />
      </Pressable>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
      <Animated.View style={[styles.blob1, { transform: [{ translateX: waveDrift1 }] }]} />
      <Animated.View style={[styles.blob2, { transform: [{ translateX: waveDrift2 }] }]} />
      <Animated.View style={[styles.blob3, { transform: [{ translateX: waveDrift3 }] }]} />
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{nickName}님의 농장</Text>
        <Text style={styles.headerSubtitle}>현재 {data.length}개의 농장이 연결되어 있습니다</Text>
      </View>
      </View>

      <FlatList
        contentContainerStyle={{padding: 16}}
        ItemSeparatorComponent={() => <View style={{height: 12}}/>}
        data={data}
        keyExtractor={(item) => item.farmId.toString()}
        renderItem={({item}: {item: FarmItem}) => (
          <Pressable
            style={({pressed}) => [styles.card, pressed && {opacity: 0.8}]}
            onPress={() => router.push({
              pathname: '/(farmer-tabs)/farm/[farmId]',
              params: {farmId: item.farmId}
            })}
          >
            {item.farmImg ? (
              <Image source={{uri: item.farmImg}} style={styles.cardImg}/>
            ) : (
              <View style={styles.cardImgPlaceholder}/>
            )}

            <Text style={styles.farmName}>{item.farmName}</Text>

            <View style={styles.addrRow}>
              <Ionicons name="location-outline" size={13} color="#888" />
              <Text style={styles.farmAddr}>{item.farmAddr}</Text>
            </View>

            <Text style={styles.farmDesc}>{item.farmDesc}</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailBtn}>상세보기 &gt;</Text>
            </View>
          </Pressable>
        )}  
      />

      <Pressable
        style={({pressed}) => [styles.regBtn, pressed && styles.pressed]}
        onPress={e => router.push('/(farmer-tabs)/farm/register')}
      >
        <AntDesign name="plus" size={24} color="white" />
      </Pressable>

      
    </SafeAreaView>
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
    borderBottomColor: '#6A9469',  // 초록 포인트 라인
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
    backgroundColor: '#6A9469',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pressed: {
    opacity: 0.8
  },

  addrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  detailRow: {
    alignItems: 'flex-end',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  detailBtn: {
    fontSize: 13,
    color: '#6A9469',
    fontWeight: '600',
  },
  cardImg: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardImgPlaceholder: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    backgroundColor: '#d4e8d4',
    marginBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6f0',
    position: 'relative'
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d4a1e',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 13,
    color: '#888',
  },
  header: {
    height: 130,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
    paddingBottom: 18,
    paddingHorizontal: 24,
  },
  blob1: {
    position: 'absolute', width: 280, height: 280,
    borderRadius: 140, backgroundColor: '#CCDECB',
    top: -140, right: -60, opacity: 0.70,
  },
  blob2: {
    position: 'absolute', width: 180, height: 180,
    borderRadius: 90, backgroundColor: '#BDD5BC',
    top: -80, right: 40, opacity: 0.45,
  },
  blob3: {
    position: 'absolute', width: 130, height: 130,
    borderRadius: 65, backgroundColor: '#E2F0E2',
    bottom: -50, left: -20, opacity: 0.60,
  },
  headerContent: { zIndex: 10 },
  headerTitle: {
    fontSize: 28, fontWeight: '800',
    color: '#1A2E1A', letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 13, color: '#8A9E8A', marginTop: 2,
  },
})