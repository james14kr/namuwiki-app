import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useUnlinkDevice } from '@/queries/device/useUnlinkDevice'
import { DeviceItem, DeviceRegisterData } from '@/types/deviceType'
import { getUserEmail } from '@/utils'
import { useGetCropList } from '@/queries/crop/useGetCropList'
import { useGetMyCropList } from '@/queries/crop/useGetMyCropList'
import { useGetMyDevices } from '@/queries/device/useGetMyDevices'
import { usePostDeviceRegister } from '@/queries/device/usePostDeviceRegister'
import { CropItem } from '@/types/cropType'
import Toast from 'react-native-toast-message'

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

  useEffect(() => {
    getUserEmail().then((email) => {
      setFarmerEmail(email)
      setDevice(prev => ({...prev, farmerEmail: email ?? ''}))
    })
  }, [])

  const {data: cropList} = useGetMyCropList(farmerEmail ?? '')
  const {data: deviceList} = useGetMyDevices(farmerEmail ?? '')
  const {mutate: registerDevice} = usePostDeviceRegister()

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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📡 기기 등록</Text>

      {/* 기기 ID 입력 */}
      <Text style={styles.label}>기기 ID</Text>
      <TextInput
        style={styles.input}
        placeholder='기기 ID를 입력하세요'
        value={device.deviceId}
        onChangeText={(text) => setDevice({...device, deviceId: text})}
        autoCapitalize='none'
      />

      {/* 농작물 선택 */}
      <Text style={styles.label}>연결할 농작물 선택</Text>
      <View style={styles.cropSelectRow}>
       {cropList?.map((crop: CropItem) => (
        <Pressable
          key={crop.cropId}
          style={[styles.cropBtn, device.cropId === crop.cropId && styles.cropBtnSelected]}
          onPress={() => setDevice({...device, cropId: crop.cropId})}
        >
          <Text>
            {crop.cropName}
          </Text>
        </Pressable>
       ))}
      </View>

      <Pressable style={styles.submitBtn} onPress={handleSubmit}>
       <Text style={styles.submitText}>등록하기</Text>
      </Pressable>

      {/* 내 기기 등록 */}
      <Text style={styles.sectionTitle}>📋 내 기기 목록</Text>
       <FlatList
        data={deviceList}
        keyExtractor={(item) => item.deviceId}
        renderItem={({item} : {item: DeviceItem}) => <DeviceCard item={item}/>}
        scrollEnabled={false}
       />

    </ScrollView>
  )
}

export default Device

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f0',
    padding: 20,
    paddingTop: 60,
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
})