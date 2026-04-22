import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { FarmRegisterData } from '@/types/farmType'
import { getUserEmail } from '@/utils/auth'
import { usePostFarmRegister } from '@/queries/farm/FarmRegister'
import { useRouter } from 'expo-router'
import DaumPostcode from 'react-native-daum-postcode'

const FarmRegister = () => {

  const router = useRouter()
  const [showPostcode, setShowPostcode] = useState(false)

  const [farm, setFarm] = useState<FarmRegisterData>({
    farmerEmail: '',
    farmName: '',
    farmAddr: '',
    farmDesc: ''
  })

  const {mutate: registerFarm} = usePostFarmRegister()

  useEffect(() => {
    getUserEmail().then((email) => {
      setFarm(prev => ({...prev, farmerEmail: email ?? ''}))
    })
  }, [])

  const handleSubmit = () => {
    registerFarm(farm, {
      onSuccess: () => {
        router.back()
      },
      onError: (e) => {
        console.log('농장 등록 실패', e)
      }
    })
  }

  const handleAddressSelect = (data: any) => {
    setFarm({...farm, farmAddr: data.address})
    setShowPostcode(false)
  }

  return (
    <ScrollView style={styles.container}>
      {/* 타이틀 */}
      <Text style={styles.title}>🌱 농장 등록</Text>

      {/* 농장 이름 */}
      <Text style={styles.label}>농장 이름 *</Text>
      <TextInput
        style={styles.input}
        placeholder='농장 이름을 입력하세요'
        value={farm.farmName}
        onChangeText={(text) => setFarm({...farm, farmName: text})}
      />

      {/* 농장 주소 */}
      <Text style={styles.label}>농장 주소</Text>
      <View style={styles.addrRow}>
        <TextInput
          style={[styles.input, {flex: 1, marginBottom: 0}]}
          placeholder='주소 검색을 클릭하세요'
          value={farm.farmAddr}
          editable={false}
        />
        <Pressable
          style={styles.addrBtn}
          onPress={() => setShowPostcode(true)}
        >
          <Text style={styles.addrBtnText}>검색</Text>
        </Pressable>
      </View>
      
      {/* 주소 검색 모달 */}
      <Modal visible={showPostcode} animationType='slide'>
        <DaumPostcode
          onSelected={handleAddressSelect}
          onError={() => setShowPostcode(false)}
        />
      </Modal>

      {/* 농장 소개 */}
      <Text style={styles.label}>농장 소개</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder='농장을 간단히 소개해주세요'
        value={farm.farmDesc}
        onChangeText={(text) => setFarm({...farm, farmDesc: text})}
        multiline
        numberOfLines={4}
      />

      <Pressable style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>농장 등록하기</Text>
      </Pressable>
    </ScrollView>
  )
}

export default FarmRegister

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f0',
    padding: 20,
    paddingTop: 60
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d4a1e',
    marginBottom: 24
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6
  },
  input: {
    backgroundColor :'#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    fontSize: 15,
    marginBottom: 16
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top'
  },
  submitBtn: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  addrRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  addrBtn: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center'
  },
  addrBtnText: {
    color: '#fff',
    fontWeight: 'bold'
  }
})