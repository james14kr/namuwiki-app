import { useState, useEffect } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useGetSensorData } from '@/queries/sensor/useGetSensorData'
import { usePatchThreshold } from '@/queries/sensor/usePatchThreshold'
import { usePatchDeviceControl } from '@/queries/device/usePatchDeviceControl'
import { getUserEmail } from '@/utils'
import { useGetMyDevices } from '@/queries/device/useGetMyDevices'
import { DeviceItem } from '@/types/deviceType'

const ControlScreen = () => {
  const { cropId, deviceId, crops } = useLocalSearchParams<{
    cropId: string
    deviceId: string
    crops: string
  }>()

  const numericCropId = Number(cropId)

  const [farmerEmail, setFarmerEmail] = useState<string | null>(null)
  
  useEffect(() => {
    getUserEmail().then(email => setFarmerEmail(email))
  }, [])

  const {data: deviceList} = useGetMyDevices(farmerEmail ?? '')

  const { data: sensorData } = useGetSensorData(numericCropId)
  const { mutate: patchThreshold, isPending: isThresholdPending } = usePatchThreshold()
  const { mutate: patchControl, isPending: isControlPending } = usePatchDeviceControl()

  const [threshold, setThreshold] = useState({
    tempMin: '', tempMax: '',
    humidityMin: '', humidityMax: '',
    soilMin: '', soilMax: '',
    luxMin: '', luxMax: '',
  })

  const [fanOverride, setFanOverride] = useState<number | null>(null)
  const [ledOverride, setLedOverride] = useState<number | null>(null)
  const [pumpOverride, setPumpOverride] = useState<number | null>(null)

  useEffect(() => {
    if (sensorData) {
      setThreshold({
        tempMin: String(sensorData.tempMin),
        tempMax: String(sensorData.tempMax),
        humidityMin: String(sensorData.humidityMin),
        humidityMax: String(sensorData.humidityMax),
        soilMin: String(sensorData.soilMin),
        soilMax: String(sensorData.soilMax),
        luxMin: String(sensorData.luxMin),
        luxMax: String(sensorData.luxMax),
      })
    }
  }, [sensorData])

  useEffect(() => {
    if(!deviceList || !deviceId) return
    const currentDevice = deviceList.find((d: DeviceItem) => d.deviceId === deviceId)
    if(currentDevice){
      setFanOverride(currentDevice.fanOverride)
      setLedOverride(currentDevice.ledOverride)
      setPumpOverride(currentDevice.pumpOverride)
    }
  }, [deviceList, deviceId])

  const handleSaveThreshold = () => {
    patchThreshold({
      crops: crops || 'default',
      tempMin: Number(threshold.tempMin),
      tempMax: Number(threshold.tempMax),
      humidityMin: Number(threshold.humidityMin),
      humidityMax: Number(threshold.humidityMax),
      soilMin: Number(threshold.soilMin),
      soilMax: Number(threshold.soilMax),
      luxMin: Number(threshold.luxMin),
      luxMax: Number(threshold.luxMax),
    }, {
      onSuccess: () => Alert.alert('완료', '임계값이 저장되었습니다.'),
      onError: () => Alert.alert('오류', '임계값 저장에 실패했습니다.')
    })
  }

  const handleSaveControl = () => {
    if (!deviceId) return
    patchControl({
      deviceId,
      fanOverride,
      ledOverride,
      pumpOverride,
    }, {
      onSuccess: () => Alert.alert('완료', '제어 명령이 전송되었습니다.'),
      onError: () => Alert.alert('오류', '제어 명령 전송에 실패했습니다.')
    })
  }

  const OverrideToggle = ({ label, value, onChange }: {
    label: string
    value: number | null
    onChange: (v: number | null) => void
  }) => (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={styles.toggleBtns}>
        <Pressable style={[styles.toggleBtn, value === null && styles.toggleActive]}
          onPress={() => onChange(null)}>
          <Text style={[styles.toggleText, value === null && styles.toggleTextActive]}>자동</Text>
        </Pressable>
        <Pressable style={[styles.toggleBtn, value === 1 && styles.toggleOn]}
          onPress={() => onChange(1)}>
          <Text style={[styles.toggleText, value === 1 && styles.toggleTextActive]}>ON</Text>
        </Pressable>
        <Pressable style={[styles.toggleBtn, value === 0 && styles.toggleOff]}
          onPress={() => onChange(0)}>
          <Text style={[styles.toggleText, value === 0 && styles.toggleTextActive]}>OFF</Text>
        </Pressable>
      </View>
    </View>
  )

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📐 임계값 설정</Text>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>온도 최소 (°C)</Text>
            <TextInput style={styles.input} keyboardType="numeric"
              value={threshold.tempMin}
              onChangeText={v => setThreshold(prev => ({ ...prev, tempMin: v }))} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>온도 최대 (°C)</Text>
            <TextInput style={styles.input} keyboardType="numeric"
              value={threshold.tempMax}
              onChangeText={v => setThreshold(prev => ({ ...prev, tempMax: v }))} />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>습도 최소 (%)</Text>
            <TextInput style={styles.input} keyboardType="numeric"
              value={threshold.humidityMin}
              onChangeText={v => setThreshold(prev => ({ ...prev, humidityMin: v }))} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>습도 최대 (%)</Text>
            <TextInput style={styles.input} keyboardType="numeric"
              value={threshold.humidityMax}
              onChangeText={v => setThreshold(prev => ({ ...prev, humidityMax: v }))} />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>토양수분 최소 (%)</Text>
            <TextInput style={styles.input} keyboardType="numeric"
              value={threshold.soilMin}
              onChangeText={v => setThreshold(prev => ({ ...prev, soilMin: v }))} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>토양수분 최대 (%)</Text>
            <TextInput style={styles.input} keyboardType="numeric"
              value={threshold.soilMax}
              onChangeText={v => setThreshold(prev => ({ ...prev, soilMax: v }))} />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>조도 최소 (lux)</Text>
            <TextInput style={styles.input} keyboardType="numeric"
              value={threshold.luxMin}
              onChangeText={v => setThreshold(prev => ({ ...prev, luxMin: v }))} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>조도 최대 (lux)</Text>
            <TextInput style={styles.input} keyboardType="numeric"
              value={threshold.luxMax}
              onChangeText={v => setThreshold(prev => ({ ...prev, luxMax: v }))} />
          </View>
        </View>

        <Pressable style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}
          onPress={handleSaveThreshold} disabled={isThresholdPending}>
          <Text style={styles.saveBtnText}>
            {isThresholdPending ? '저장 중...' : '임계값 저장'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎛 수동 제어</Text>
        <Text style={styles.sectionDesc}>자동: 센서값 기반 자동 제어 / ON·OFF: 강제 제어</Text>

        <OverrideToggle label="🌀 팬" value={fanOverride} onChange={setFanOverride} />
        <OverrideToggle label="💡 LED" value={ledOverride} onChange={setLedOverride} />
        <OverrideToggle label="💧 펌프" value={pumpOverride} onChange={setPumpOverride} />

        <Pressable style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}
          onPress={handleSaveControl} disabled={isControlPending}>
          <Text style={styles.saveBtnText}>
            {isControlPending ? '전송 중...' : '제어 명령 전송'}
          </Text>
        </Pressable>
      </View>

    </ScrollView>
  )
}

export default ControlScreen

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, gap: 16 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2C4A2C', marginBottom: 4 },
  sectionDesc: { fontSize: 12, color: '#888', marginBottom: 8 },
  inputRow: { flexDirection: 'row', gap: 12 },
  inputGroup: { flex: 1, gap: 4 },
  inputLabel: { fontSize: 12, color: '#555' },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 10, fontSize: 14, backgroundColor: '#fafafa'
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
  },
  toggleLabel: { fontSize: 15, color: '#333', fontWeight: '500' },
  toggleBtns: { flexDirection: 'row', gap: 8 },
  toggleBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fafafa'
  },
  toggleActive: { backgroundColor: '#6A9469', borderColor: '#6A9469' },
  toggleOn: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  toggleOff: { backgroundColor: '#F44336', borderColor: '#F44336' },
  toggleText: { fontSize: 13, color: '#555', fontWeight: '500' },
  toggleTextActive: { color: '#fff' },
  saveBtn: {
    backgroundColor: '#2C4A2C', borderRadius: 10,
    padding: 14, alignItems: 'center', marginTop: 8
  },
  pressed: { opacity: 0.7 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
})