import { FlatList, Pressable, StyleSheet, Text, View, Image, ActivityIndicator, ScrollView, ImageBackground } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useGetCropList } from '@/queries/crop/useGetCropList'
import { CropItem } from '@/types/cropType'
import { Ionicons } from '@expo/vector-icons'
import { useGetFarmDetail } from '@/queries/farm/useGetFarmDetail'

const FarmDetailScreen = () => {
  const router = useRouter()
  const { farmId } = useLocalSearchParams()
  const numericFarmId = Number(farmId)

  const { data: cropList, isLoading } = useGetCropList(numericFarmId)
  const { data: farmDetail, isLoading: farmLoading} = useGetFarmDetail(numericFarmId)

  if (isLoading || farmLoading) return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color="#6A9469" style={{ marginTop: 100 }} />
    </SafeAreaView>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#2C4A2C" />
        </Pressable>
        <Text style={styles.headerTitle}>농작물 목록</Text>
      </View>

      <FlatList
        data={cropList}
        keyExtractor={(item) => item.cropId.toString()}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          <>
            {/* 농장 배너 */}
            {farmDetail?.farmImg ? (
              <ImageBackground
                source={{ uri: farmDetail.farmImg }}
                style={styles.banner}
                resizeMode="cover"
              >
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerFarmName}>{farmDetail.farmName}</Text>
                  <View style={styles.bannerAddrRow}>
                    <Ionicons name="location-outline" size={13} color="#fff" />
                    <Text style={styles.bannerAddr}>{farmDetail.farmAddr}</Text>
                  </View>
                </View>
              </ImageBackground>
            ) : (
              <View style={[styles.banner, { backgroundColor: '#6A9469' }]}>
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
            {farmDetail?.farmDesc ? (
              <View style={styles.introCard}>
                <Text style={styles.introTitle}>농장 소개</Text>
                <Text style={styles.introDesc}>{farmDetail.farmDesc}</Text>
              </View>
            ) : null}

            {/* 농작물 목록 헤더 */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🌱 농작물 목록</Text>
            </View>
          </>
        }

        renderItem={({ item }: { item: CropItem }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
            onPress={() => router.push({
              pathname: '/(user-tabs)/farm/cropHealth/[cropId]',
              params: { cropId: item.cropId, cropName: item.cropName }
            })}
          >
            {item.cropImg ? (
              <Image source={{ uri: item.cropImg }} style={styles.cropImg} />
            ) : (
              <View style={styles.cropImgPlaceholder}>
                <Text style={{ fontSize: 32 }}>🌱</Text>
              </View>
            )}
            <View style={styles.cardContent}>
              <Text style={styles.cropName}>{item.cropName}</Text>
              <Text style={styles.cropDesc} numberOfLines={2}>{item.cropDesc}</Text>
              <Text style={styles.cropPrice}>
                {item.cropPrice ? `${item.cropPrice.toLocaleString()}원` : '가격 미정'}
              </Text>
              <View style={styles.healthRow}>
                <Text style={styles.healthLink}>건강도 확인하기 &gt;</Text>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>등록된 농작물이 없습니다</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

export default FarmDetailScreen

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f0' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C4A2C' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cropImg: { width: '100%', height: 120 },
  cropImgPlaceholder: {
    width: '100%', height: 200,
    backgroundColor: '#e8f5e8',
    alignItems: 'center', justifyContent: 'center',
  },
  cardContent: { padding: 14 },
  cropName: { fontSize: 17, fontWeight: 'bold', color: '#2C4A2C', marginBottom: 4 },
  cropDesc: { fontSize: 13, color: '#888', marginBottom: 8 },
  cropPrice: { fontSize: 15, fontWeight: '600', color: '#6A9469', marginBottom: 8 },
  healthRow: { alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 8 },
  healthLink: { fontSize: 13, color: '#6A9469', fontWeight: '600' },
  emptyWrap: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 15, color: '#aaa' },
  banner: {
  height: 200,
  justifyContent: 'flex-end',
  },
  bannerOverlay: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  bannerFarmName: {
    fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4,
  },
  bannerAddrRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  bannerAddr: {
    fontSize: 13, color: '#eee',
  },
  introCard: {
    marginHorizontal: 0,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  introTitle: {
    fontSize: 14, fontWeight: 'bold', color: '#2C4A2C', marginBottom: 8,
  },
  introDesc: {
    fontSize: 13, color: '#666', lineHeight: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15, fontWeight: 'bold', color: '#2C4A2C',
  },
})