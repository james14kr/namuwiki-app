import { useGetSensorData } from '@/queries/sensor/useGetSensorData'
import { useGetSensorHistory } from '@/queries/sensor/useGetSensorHistory'
import { SensorHistory } from '@/types/namuType'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { LineChart } from 'react-native-gifted-charts'

const Sensor = () => {
  const { cropId } = useLocalSearchParams()
  const numericCropId = Number(cropId)

  const { data: sensorData, isLoading, isError, error } = useGetSensorData(numericCropId)

  const [activeTab, setActiveTab] = useState<'temp' | 'humidity' | 'soil' | 'lux'>('temp')
  const [chartPeriod, setChartPeriod] = useState<'day'| 'week' | 'month'>('day')
  const [historyPeriod, setHistoryPeriod] = useState<'day'| 'week' | 'month'>('day')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [historyLimit, setHistoryLimit] = useState(5)

  const getStartDate = (p: 'day' | 'week' | 'month') => {
    const now = new Date()
    if(p === 'day') now.setDate(now.getDate() - 1)
    else if(p === 'week') now.setDate(now.getDate() -7)
    else now.setMonth(now.getMonth() -1)
    return now.toISOString().split('T')[0]
  }

  useEffect(() => {
    setHistoryLimit(5)
  }, [historyPeriod])

  const limitMap = {day: 100, week: 200, month: 500}

  const { data: chartHistoryList } = useGetSensorHistory(
    numericCropId,
    limitMap[chartPeriod],
    getStartDate(chartPeriod)
  )
  const { data: historyList } = useGetSensorHistory(
    numericCropId,
    historyLimit,
    getStartDate(historyPeriod)
  )

  const chartData = chartHistoryList?.map(item => {
    const valueMap = {
      temp: item.tempC,
      humidity: item.humidity,
      soil: item.soilMoistureValue,
      lux: item.ldrValue
    }
    return {value: valueMap[activeTab]}
  }) ?? []

  if (isLoading && !sensorData) return <Text>로딩 중...</Text>

  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 70}}>
      <Text style={styles.title}>📡 센서 데이터</Text>

      {/* 연결된 기기 없음 처리 */}
      {!sensorData ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>연결된 기기가 없습니다</Text>
        </View>
      ) : (
        <>
          {/* 기기 정보 */}
          <Text style={styles.deviceInfo}>연결된 농작물: {sensorData.crops}</Text>
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
          <View style={styles.actuatorRow}>
            <Pressable
              style={({pressed}) => [styles.controlBtn, pressed && styles.pressed]}
              onPress={() => router.push({
                pathname: '/(farmer-tabs)/farm/control',
                params: {
                  cropId: String(cropId),
                  deviceId: sensorData?.deviceId,
                  crops: sensorData?.crops
                }
              })}
            >
              <Text style={styles.controlBtnText}>⚙️ 기기 제어</Text>
            </Pressable>
          </View>
        </>
      )}

  

      <View style={styles.historyHeader}><Text style={styles.sectionTitle}>📊 측정 차트</Text></View>

      {/* 기간 탭 버튼 */}
      <View style={styles.periodRow}>
        {(['day', 'week', 'month'] as const).map(p => {
          const labelMap = {day: '하루', week: '일주일', month: '한달'}
          return(
            <Pressable
              key={p}
              style={[styles.periodBtn, chartPeriod === p && styles.periodBtnActive]}
              onPress={() => setChartPeriod(p)}
            >
              <Text style={[styles.periodBtnText, chartPeriod === p && styles.periodBtnTextActive]}>
                {labelMap[p]}
              </Text>
            </Pressable>
          )
        })}

      </View>

      {/* 탭 버튼 */}
      <View style={styles.tabRow}>
        {(['temp', 'humidity', 'soil', 'lux']as const).map(tab => {
          const labelMap = { temp: '🌡️온도', humidity: '💧습도', soil: '🌱토양', lux: '☀️조도' }
          return(
            <Pressable
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
                {labelMap[tab]}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {/* 차트 */}
      {chartData.length > 0 ? (
        <LineChart
          data={chartData}
          height={200}
          color1='#6a9469'
          thickness={2}
          hideDataPoints={false}
          dataPointsColor='#2c4a2c'
          backgroundColor="#fff"
          curved
          yAxisTextStyle={{color: '#888', fontSize: 11}}
          noOfSections={4}
          initialSpacing={10}
        />
      ) : (
        <Text style={styles.emptyText}>히스토리 데이터가 없습니다.</Text>
      )}
  
      {/* 히스토리 */}
      <Pressable style={styles.historyHeader} onPress={() => setIsHistoryOpen(prev => !prev)}>
        <Text style={styles.sectionTitle}>📋 측정 히스토리</Text>
        <Text style={styles.toggleIcon}>{isHistoryOpen ? '▲' : '▼'}</Text>
      </Pressable>

      {isHistoryOpen && (
        <>
          <View style={styles.periodRow}>
            {(['day', 'week', 'month'] as const).map(p => {
              const labelMap = {day: '하루', week: '일주일', month: '한달'}
              return(
                <Pressable
                  key={p}
                  style={[styles.periodBtn, historyPeriod === p && styles.periodBtnActive]}
                  onPress={() => setHistoryPeriod(p)}
                >
                  <Text style={[styles.periodBtnText, historyPeriod === p && styles.periodBtnTextActive]}>
                    {labelMap[p]}
                  </Text>
                </Pressable>
              )
            })}

          </View>
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
          {(historyList?.length ?? 0) >= historyLimit &&(
            <Pressable
              style={styles.loadMoreBtn}
              onPress={() => setHistoryLimit(prev => prev + 5)}
            >
              <Text style={styles.loadMoreText}>더 보기</Text>
            </Pressable>
          )}
        </>

      )}

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
  tabRow: {
  flexDirection: 'row',
  gap: 8,
  marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    elevation: 1,
  },
  tabBtnActive: {
    backgroundColor: '#6A9469',
  },
  tabBtnText: {
    fontSize: 11,
    color: '#666',
  },
  tabBtnTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  periodRow: {
  flexDirection: 'row',
  gap: 8,
  marginBottom: 12,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  periodBtnActive: {
    backgroundColor: '#2C4A2C',
    borderColor: '#2C4A2C',
  },
  periodBtnText: {
    fontSize: 13,
    color: '#666',
  },
  periodBtnTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  historyHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  },
  toggleIcon: {
    fontSize: 13,
    color: '#6A9469',
  },
  loadMoreBtn: {
  backgroundColor: '#fff',
  borderRadius: 8,
  padding: 12,
  alignItems: 'center',
  marginTop: 8,
  borderWidth: 1,
  borderColor: '#ddd',
  },
  loadMoreText: {
    fontSize: 13,
    color: '#6A9469',
    fontWeight: 'bold',
  },
  controlBtn: {
    flex: 1,
    backgroundColor: '#2C4A2C',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 10
  },
  controlBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
  pressed: { opacity: 0.7 },
})