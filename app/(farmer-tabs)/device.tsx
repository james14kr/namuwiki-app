import { FlatList, Pressable, StyleSheet, Text, View, Image, ActivityIndicator, Animated, ScrollView, TextInput } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import { useUnlinkDevice } from '@/queries/device/useUnlinkDevice'
import { DeviceItem, DeviceRegisterData } from '@/types/deviceType'
import { getUserEmail } from '@/utils'
import { useGetCropList } from '@/queries/crop/useGetCropList'
import { useGetMyDevices } from '@/queries/device/useGetMyDevices'
import { usePostDeviceRegister } from '@/queries/device/usePostDeviceRegister'
import { CropItem } from '@/types/cropType'
import Toast from 'react-native-toast-message'
import { useGetMyFarmList } from '@/queries/farm/useGetMyFarmList'
import { FarmItem } from '@/types/farmType'
import { SafeAreaView } from 'react-native-safe-area-context'

const DeviceCard = ({item} : {item: DeviceItem}) => {
  const {mutate: unlinkDevice} = useUnlinkDevice(item.cropId ?? 0)

  return(
    <View style={styles.deviceCard}>
      <View>
        <Text style={styles.deviceId}>{item.deviceId}</Text>
        <Text style={styles.deviceCrop}>
          {item.cropName} / {item.farmName}
        </Text>
        <Text style={item.isActive === 1 ? styles.activeText : styles.inactiveText}>
          {item.isActive === 1 ? '● 활성' : '○ 비활성'}
        </Text>
      </View>
      <Pressable onPress={() => unlinkDevice()}>
        <Text style={styles.unlinkText}>해제</Text>
      </Pressable>
    </View>
  )
}

const Device = () => {

  const [farmerEmail, setFarmerEmail] = useState<string | null>(null)
  const [device, setDevice] = useState<DeviceRegisterData>({
    deviceId: '',
    cropId: 0,
    farmerEmail: ''
  })
  const [selectedFarmId, setSelectedFarmId] = useState(0)

  useEffect(() => {
    getUserEmail().then((email) => {
      setFarmerEmail(email)
      setDevice(prev => ({...prev, farmerEmail: email ?? ''}))
    })
  }, [])

  const {data: farmList} = useGetMyFarmList(farmerEmail ?? '')
  const {data: cropList} = useGetCropList(selectedFarmId)
  const {data: deviceList} = useGetMyDevices(farmerEmail ?? '')
  const {mutate: registerDevice} = usePostDeviceRegister()

  const selectedFarmName = farmList?.find((f: FarmItem) => f.farmId === selectedFarmId)?.farmName
  const filteredDeviceList = selectedFarmId === 0
    ? []
    : deviceList?.filter((d: DeviceItem) => d.farmName === selectedFarmName)
  
  const handleSubmit = () => {
    if(!device.deviceId || device.cropId === 0) return
    registerDevice(device, {
      onSuccess: () => setDevice(prev => ({...prev, deviceId: '', cropId: 0})),
      onError: () => {
        Toast.show({
          type: 'error',
          text1: '기기 등록 실패',
          text2: '기기 ID를 확인해주세요'
        })
        setDevice(prev => ({...prev, deviceId: '', cropId: 0}))
      }
    })
  }

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f6f0' }}>

      <View style={styles.header}>
        <Animated.View style={[styles.blob1, { transform: [{ translateX: waveDrift1 }] }]} />
        <Animated.View style={[styles.blob2, { transform: [{ translateX: waveDrift2 }] }]} />
        <Animated.View style={[styles.blob3, { transform: [{ translateX: waveDrift3 }] }]} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>기기 등록</Text>
          <Text style={styles.headerSubtitle}>농작물에 센서 기기를 연결하세요</Text>
        </View>
      </View>
      <ScrollView style={styles.container}>
  
        {/* 농장 선택 */}
        <Text style={styles.label}>농장 선택</Text>
        <View style={styles.cropSelectRow}>
          {farmList?.map((farm: FarmItem) => (
            <Pressable
              key={farm.farmId}
              style={[styles.cropBtn, selectedFarmId === farm.farmId && styles.cropBtnSelected]}
              onPress={() => {
                setSelectedFarmId(farm.farmId)
                setDevice(prev => ({...prev, cropId: 0}))
              }}
            >
              <Text style={[styles.cropBtnText, selectedFarmId === farm.farmId && styles.cropBtnTextSelected]}>{farm.farmName}</Text>
            </Pressable>
          ))}
        </View>
  
        {/* 농작물 선택 */}
        {selectedFarmId !== 0 && (
          <>
            <Text style={styles.label}>연결할 농작물 선택</Text>
            <View style={styles.cropSelectRow}>
            {cropList?.map((crop: CropItem) => (
              <Pressable
                key={crop.cropId}
                style={[styles.cropBtn, device.cropId === crop.cropId && styles.cropBtnSelected]}
                onPress={() => setDevice({...device, cropId: crop.cropId})}
              >
                <Text style={[styles.cropBtnText, device.cropId === crop.cropId && styles.cropBtnTextSelected]}>
                  {crop.cropName}
                </Text>
              </Pressable>
            ))}
            </View>
          </>
        )}

        {/* 기기 ID 입력 */}
        <Text style={styles.label}>기기 ID</Text>
        <TextInput
          style={styles.input}
          placeholder='기기 ID를 입력하세요'
          value={device.deviceId}
          onChangeText={(text) => setDevice(prev => ({...prev, deviceId: text}))}
        />
  
        <Pressable style={styles.submitBtn} onPress={handleSubmit}>
         <Text style={styles.submitText}>등록하기</Text>
        </Pressable>
  
        {/* 내 기기 등록 */}
        <Text style={styles.sectionTitle}>
          📋{selectedFarmName ? `${selectedFarmName} 농장에 연결된 기기 목록` : '내 기기 목록'}
        </Text>
         <FlatList
          data={filteredDeviceList}
          keyExtractor={(item) => item.deviceId}
          renderItem={({item} : {item: DeviceItem}) => <DeviceCard item={item}/>}
          scrollEnabled={false}
         />
  
      </ScrollView>
    </SafeAreaView>
  )
}

export default Device

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f0',
    padding: 20,
  },

  // 타이틀
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C4A2C',
    marginBottom: 24,
  },

  // 공통 폼
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    fontSize: 15,
    marginBottom: 16,
  },

  // 농작물 선택 버튼
  cropSelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  cropBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8A9E8A',
  },
  cropBtnSelected: {
    backgroundColor: '#6A9469',
    borderColor: '#6A9469',
  },
  cropBtnText: {
    fontSize: 13,
    color: '#8A9E8A',
  },
  cropBtnTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // 등록 버튼
  submitBtn: {
    backgroundColor: '#6A9469',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 32,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // 섹션 타이틀
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C4A2C',
    marginBottom: 12,
  },

  // 기기 카드
  deviceCard: {
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
  deviceId: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2C4A2C',
    marginBottom: 4,
  },
  deviceCrop: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  activeText: {
    fontSize: 12,
    color: '#6A9469',
    fontWeight: 'bold',
  },
  inactiveText: {
    fontSize: 12,
    color: '#8A9E8A',
  },
  unlinkText: {
    color: '#ff4444',
    fontSize: 13,
    fontWeight: 'bold',
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