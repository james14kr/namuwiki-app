import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import usePostCrop from '@/queries/crop/usePostCrop';
import { CropRegisterData } from '@/types/cropType';

const CropRegister = () => {

  const{farmId} = useLocalSearchParams()
  const router = useRouter()
  const{mutate: registerCrop} = usePostCrop()

  const[crop, setCrop] = useState<CropRegisterData>({
    farmId: Number(farmId),
    cropName: '',
    cropDesc: '',
    cropPrice: 0
  })

  const handleSubmit = () => {
    registerCrop(crop, {
      onSuccess: () => router.back(),
      onError: (e) => console.log('농작물 등록 실패', e)
    })
  }

  return (
    <ScrollView style={styles.container}>
      
      <Text style={styles.title}>🌱 농작물 등록</Text>

      <Text style={styles.label}>농작물 이름</Text>
      <TextInput
        style={styles.input}
        placeholder='농작물을 이름을 입력하세요'
        value={crop.cropName}
        onChangeText={(text) => setCrop({...crop, cropName: text})}
      />

      <Text style={styles.label}>농작물 소개</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder='농작물을 간단히 소개해주세요'
        value={crop.cropDesc}
        onChangeText={(text) => setCrop({...crop, cropDesc: text})}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>가격 (원)</Text>
      <TextInput
        style={styles.input}
        placeholder='농작물을 가격을 입력하세요'
        value={crop.cropPrice === 0 ? '' : String(crop.cropPrice)}
        onChangeText={(text) => setCrop({...crop, cropPrice: Number(text)})}
        keyboardType='numeric'
      />

      <Pressable style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>등록하기</Text>
      </Pressable>

    </ScrollView>
  )
}

export default CropRegister

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
    color: '#2d4a1e',
    marginBottom: 24,
  },
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
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#6A9469',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})