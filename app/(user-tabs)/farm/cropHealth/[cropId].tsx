import { ScrollView, StyleSheet, Text, View, ActivityIndicator, Pressable } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useGetSensorData } from '@/queries/sensor/useGetSensorData'
import { SensorActuatorData } from '@/types/namuType'
import { Ionicons } from '@expo/vector-icons'

// ── 센서 상태 계산 ──
type HealthStatus = 'good' | 'warning' | 'danger'

const getSensorStatus = (value: number, min: number, max: number): HealthStatus => {
  if (value >= min && value <= max) return 'good'
  const range = max - min
  const deviation = Math.max(min - value, value - max)
  if (deviation > range * 0.2) return 'danger'
  return 'warning'
}

const getCropHealthScore = (s: SensorActuatorData) => {
  const statuses: HealthStatus[] = [
    getSensorStatus(s.tempC, s.tempMin, s.tempMax),
    getSensorStatus(s.humidity, s.humidityMin, s.humidityMax),
    getSensorStatus(s.soilMoistureValue, s.soilMin, s.soilMax),
    getSensorStatus(s.ldrValue, s.luxMin, s.luxMax),
  ]
  const score = statuses.reduce((acc, st) => {
    if (st === 'good') return acc + 25
    if (st === 'warning') return acc + 12
    return acc
  }, 0)
  return { score, statuses }
}

const getHealthInfo = (score: number) => {
  if (score >= 75) return { badge: '건강함 🌱', color: '#6A9469', bg: '#e8f5e8', message: '생육 환경이 최적입니다. 안심하고 구매하셔도 됩니다.' }
  if (score >= 50) return { badge: '보통 ⚠️', color: '#FFA726', bg: '#fff8e1', message: '일부 환경이 기준치를 벗어났습니다. 농장주가 관리 중입니다.' }
  return { badge: '주의 🚨', color: '#F44336', bg: '#ffebee', message: '생육 환경이 불안정한 상태입니다.' }
}

const getStatusInfo = (status: HealthStatus) => {
  if (status === 'good') return { label: '정상', color: '#6A9469', icon: '✅' }
  if (status === 'warning') return { label: '주의', color: '#FFA726', icon: '⚠️' }
  return { label: '위험', color: '#F44336', icon: '🚨' }
}

// ── 센서 카드 ──
const SensorCard = ({
  icon, label, value, unit, min, max, status
}: {
  icon: string, label: string, value: number, unit: string,
  min: number, max: number, status: HealthStatus
}) => {
  const statusInfo = getStatusInfo(status)
  return (
    <View style={[sensorCardStyles.card, { borderLeftColor: statusInfo.color }]}>
      <Text style={sensorCardStyles.icon}>{icon}</Text>
      <Text style={sensorCardStyles.label}>{label}</Text>
      <Text style={[sensorCardStyles.value, { color: statusInfo.color }]}>{value}{unit}</Text>
      <Text style={sensorCardStyles.range}>기준 {min}~{max}{unit}</Text>
      <Text style={sensorCardStyles.status}>{statusInfo.icon} {statusInfo.label}</Text>
    </View>
  )
}

const sensorCardStyles = StyleSheet.create({
  card: {
    width: '47%', backgroundColor: '#fff',
    borderRadius: 12, padding: 14,
    borderLeftWidth: 4, elevation: 2,
    alignItems: 'center',
  },
  icon: { fontSize: 24, marginBottom: 4 },
  label: { fontSize: 12, color: '#888', marginBottom: 4 },
  value: { fontSize: 22, fontWeight: 'bold', marginBottom: 2 },
  range: { fontSize: 10, color: '#bbb', marginBottom: 4 },
  status: { fontSize: 12, fontWeight: '600' },
})

// ── 메인 화면 ──
const CropHealthScreen = () => {
  const router = useRouter()
  const { cropId, cropName } = useLocalSearchParams()
  const numericCropId = Number(cropId)

  const { data: sensorData, isLoading } = useGetSensorData(numericCropId)

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
        <Text style={styles.headerTitle}>{cropName ?? '농작물'} 건강도</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {!sensorData ? (
          // 센서 연결 없음
          <View style={styles.noSensorWrap}>
            <Text style={styles.noSensorIcon}>📡</Text>
            <Text style={styles.noSensorText}>아직 센서 데이터가 없습니다</Text>
            <Text style={styles.noSensorSub}>농장주가 기기를 연결하면 확인할 수 있어요</Text>
          </View>
        ) : (
          <>
            {/* 종합 건강 점수 카드 */}
            {(() => {
              const { score, statuses } = getCropHealthScore(sensorData)
              const healthInfo = getHealthInfo(score)
              return (
                <>
                  <View style={[styles.scoreCard, { backgroundColor: healthInfo.bg }]}>
                    <Text style={[styles.scoreBadge, { color: healthInfo.color }]}>
                      {healthInfo.badge}
                    </Text>
                    <Text style={[styles.scoreNumber, { color: healthInfo.color }]}>
                      {score}점
                    </Text>
                    <View style={styles.scoreBarBg}>
                      <View style={[styles.scoreBarFill, {
                        width: `${score}%` as any,
                        backgroundColor: healthInfo.color
                      }]} />
                    </View>
                    <Text style={styles.scoreMessage}>{healthInfo.message}</Text>
                  </View>

                  {/* 센서별 상태 카드 */}
                  <Text style={styles.sectionTitle}>📊 생육 환경 상세</Text>
                  <View style={styles.sensorGrid}>
                    <SensorCard
                      icon="🌡️" label="온도"
                      value={sensorData.tempC} unit="°C"
                      min={sensorData.tempMin} max={sensorData.tempMax}
                      status={statuses[0]}
                    />
                    <SensorCard
                      icon="💧" label="습도"
                      value={sensorData.humidity} unit="%"
                      min={sensorData.humidityMin} max={sensorData.humidityMax}
                      status={statuses[1]}
                    />
                    <SensorCard
                      icon="🌱" label="토양수분"
                      value={sensorData.soilMoistureValue} unit=""
                      min={sensorData.soilMin} max={sensorData.soilMax}
                      status={statuses[2]}
                    />
                    <SensorCard
                      icon="☀️" label="조도"
                      value={sensorData.ldrValue} unit=""
                      min={sensorData.luxMin} max={sensorData.luxMax}
                      status={statuses[3]}
                    />
                  </View>

                  {/* 안내 문구 */}
                  <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                      💡 건강 점수는 온도·습도·토양수분·조도가 농작물에 최적인 기준값 범위 내에 있는지를 기반으로 계산됩니다.
                    </Text>
                  </View>
                </>
              )
            })()}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default CropHealthScreen

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
  scoreCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreBadge: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  scoreNumber: { fontSize: 48, fontWeight: '900', marginBottom: 12 },
  scoreBarBg: {
    width: '100%', height: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 5, marginBottom: 12,
  },
  scoreBarFill: { height: 10, borderRadius: 5 },
  scoreMessage: { fontSize: 13, color: '#555', textAlign: 'center' },
  sectionTitle: {
    fontSize: 16, fontWeight: 'bold',
    color: '#2C4A2C', marginBottom: 12,
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#6A9469',
  },
  infoText: { fontSize: 12, color: '#666', lineHeight: 18 },
  noSensorWrap: { alignItems: 'center', marginTop: 80 },
  noSensorIcon: { fontSize: 48, marginBottom: 16 },
  noSensorText: { fontSize: 16, fontWeight: 'bold', color: '#2C4A2C', marginBottom: 6 },
  noSensorSub: { fontSize: 13, color: '#aaa' },
})