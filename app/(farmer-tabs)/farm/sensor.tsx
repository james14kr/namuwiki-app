import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'
import { useGetSensorData } from '@/queries/sensor/useGetSensorData'
import { useGetSensorHistory } from '@/queries/sensor/useGetSensorHistory'
import { SensorHistory } from '@/types/namuType'

const Sensor = () => {
  const { cropId } = useLocalSearchParams()
  const numericCropId = Number(cropId)

  const { data: sensorData, isLoading } = useGetSensorData(numericCropId)
  const { data: historyList } = useGetSensorHistory(numericCropId)

  if (isLoading) return <Text>로딩 중...</Text>

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📡 센서 데이터</Text>

      {/* 연결된 기기 없음 처리 */}
      {!sensorData ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>연결된 기기가 없습니다</Text>
        </View>
      ) : (
        <>
          {/* 기기 정보 */}
          <Text style={styles.deviceInfo}>기기 ID: {sensorData.deviceId}</Text>
          <Text style={styles.deviceInfo}>마지막 업데이트: {sensorData.createDate}</Text>

          {/* 센서 값 */}
          <Text style={styles.sectionTitle}>📡 센서 값</Text>
          <View style={styles.sensorGrid}>

            <View style={styles.sensorCard}>
              <Text style={styles.sensorLabel}>🌡️온도</Text>
              <Text style={styles.sensorValue}>{sensorData.tempC}°C</Text>
              <Text style={styles.sensorRange}>{sensorData.tempMin}~{sensorData.tempMax}°C</Text>
            </View>

            <View style={styles.sensorCard}>
              <Text style={styles.sensorLabel}>💧습도</Text>
              <Text style={styles.sensorValue}>{sensorData.humidity}%</Text>
            </View>

            <View style={styles.sensorCard}>
              <Text style={styles.sensorLabel}>🌱토양 수분</Text>
              <Text style={styles.sensorValue}>{sensorData.soilMoistureValue}</Text>
              <Text style={styles.sensorRange}>{sensorData.soilMin}~{sensorData.soilMax}</Text>
            </View>

            <View style={styles.sensorCard}>
              <Text style={styles.sensorLabel}>☀️조도</Text>
              <Text style={styles.sensorValue}>{sensorData.ldrValue}</Text>
              <Text style={styles.sensorRange}>{sensorData.luxMin}~{sensorData.luxMax}</Text>
            </View>

          </View>

          {/* 액추에이터 상태 */}
          <Text style={styles.sectionTitle}>⚙️ 액추에이터</Text>
          <View style={styles.actuatorRow}>
            <View style={[styles.actuatorCard, sensorData.fanStatus === 1 && styles.actuatorOn]}>
              <Text style={styles.actuatorLabel}>팬</Text>
              <Text style={styles.actuatorStatus}>{sensorData.fanStatus === 1 ? 'ON' : 'OFF'}</Text>
            </View>
            <View style={[styles.actuatorCard, sensorData.ledStatus === 1 && styles.actuatorOn]}>
              <Text style={styles.actuatorLabel}>LED</Text>
              <Text style={styles.actuatorStatus}>{sensorData.ledStatus === 1 ? 'ON' : 'OFF'}</Text>
            </View>
            <View style={[styles.actuatorCard, sensorData.pumpStatus === 1 && styles.actuatorOn]}>
              <Text style={styles.actuatorLabel}>펌프</Text>
              <Text style={styles.actuatorStatus}>{sensorData.pumpStatus === 1 ? 'ON' : 'OFF'}</Text>
            </View>
          </View>
        </>
      )}

      {/* 히스토리 */}
      <Text style={styles.sectionTitle}>📋 측정 히스토리</Text>
      <FlatList
        data={historyList}
        keyExtractor={(item, index) => index.toString()}
        scrollEnabled={false}
        renderItem={({ item }: { item: SensorHistory }) => (
          <View style={styles.historyCard}>
            <Text style={styles.historyDate}>{item.createDate}</Text>
            <View style={styles.historyRow}>
              <Text style={styles.historyItem}>🌡️ {item.tempC}°C</Text>
              <Text style={styles.historyItem}>💧 {item.humidity}%</Text>
              <Text style={styles.historyItem}>🌱 {item.soilMoistureValue}</Text>
              <Text style={styles.historyItem}>☀️ {item.ldrValue}</Text>
            </View>
          </View>
        )}
      />

    </ScrollView>
  )
}

export default Sensor

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f0',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C4A2C',
    marginBottom: 8,
  },
  deviceInfo: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C4A2C',
    marginTop: 20,
    marginBottom: 12,
  },

  // 연결 없음
  emptyBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
  },

  // 센서 카드 그리드
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sensorCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6A9469',
    elevation: 2,
  },
  sensorLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
  },
  sensorValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C4A2C',
  },
  sensorRange: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 4,
  },

  // 액추에이터
  actuatorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actuatorCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    elevation: 2,
  },
  actuatorOn: {
    backgroundColor: '#6A9469',
  },
  actuatorLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  actuatorStatus: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },

  // 히스토리
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
  },
  historyDate: {
    fontSize: 11,
    color: '#aaa',
    marginBottom: 6,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyItem: {
    fontSize: 13,
    color: '#444',
  },
})