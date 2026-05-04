import { FlatList, Pressable, StyleSheet, Text, View, Image, ActivityIndicator } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useGetFarmList } from '@/queries/farm/useGetFarmList'
import { FarmItem } from '@/types/farmType'
import { Ionicons } from '@expo/vector-icons'

const FarmListScreen = () => {
  const router = useRouter()
  const { data, isLoading } = useGetFarmList()

  if (isLoading) return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color="#6A9469" style={{ marginTop: 100 }} />
    </SafeAreaView>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌿 스마트 농장</Text>
        <Text style={styles.headerSubtitle}>신선한 농작물을 만나보세요</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.farmId.toString()}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }: { item: FarmItem }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
            onPress={() => router.push({
              pathname: '/(user-tabs)/farm/[farmId]',
              params: { farmId: item.farmId }
            })}
          >
            {item.farmImg ? (
              <Image source={{ uri: item.farmImg }} style={styles.cardImg} />
            ) : (
              <View style={styles.cardImgPlaceholder} />
            )}
            <Text style={styles.farmName}>{item.farmName}</Text>
            <View style={styles.addrRow}>
              <Ionicons name="location-outline" size={13} color="#888" />
              <Text style={styles.farmAddr}>{item.farmAddr}</Text>
            </View>
            <Text style={styles.farmDesc} numberOfLines={2}>{item.farmDesc}</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailBtn}>농작물 보기 &gt;</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>등록된 농장이 없습니다</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

export default FarmListScreen

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f0' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2C4A2C' },
  headerSubtitle: { fontSize: 13, color: '#888', marginTop: 2 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderBottomWidth: 4,
    borderBottomColor: '#6A9469',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImg: { width: '100%', height: 140, borderRadius: 8, marginBottom: 10 },
  cardImgPlaceholder: { width: '100%', height: 140, borderRadius: 8, backgroundColor: '#d4e8d4', marginBottom: 10 },
  farmName: { fontSize: 18, fontWeight: 'bold', color: '#2C4A2C', marginBottom: 6 },
  addrRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  farmAddr: { fontSize: 13, color: '#666' },
  farmDesc: { fontSize: 13, color: '#999', marginBottom: 8 },
  detailRow: { alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 8 },
  detailBtn: { fontSize: 13, color: '#6A9469', fontWeight: '600' },
  emptyWrap: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 15, color: '#aaa' },
})