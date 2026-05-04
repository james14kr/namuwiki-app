import { FlatList, Pressable, StyleSheet, Text, View, Image, ActivityIndicator, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useGetCropList } from '@/queries/crop/useGetCropList'
import { CropItem } from '@/types/cropType'
import { Ionicons } from '@expo/vector-icons'

const FarmDetailScreen = () => {
  const router = useRouter()
  const { farmId } = useLocalSearchParams()
  const numericFarmId = Number(farmId)

  const { data: cropList, isLoading } = useGetCropList(numericFarmId)

  if (isLoading) return (
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
    width: '100%', height: 120,
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
})