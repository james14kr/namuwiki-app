import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import usePostCrop from '@/queries/crop/usePostCrop';
import { CropRegisterData } from '@/types/cropType';
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import { Image, ActivityIndicator } from 'react-native'
import { api } from '@/utils/axios'

const CropRegister = () => {

  const{farmId} = useLocalSearchParams()
  const router = useRouter()
  const{mutate: registerCrop} = usePostCrop()

  const [image, setImage] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const[crop, setCrop] = useState<CropRegisterData>({
    farmId: Number(farmId),
    cropName: '',
    cropDesc: '',
    cropPrice: 0,
    cropImg: ''
  })

  const uploadImageToS3 = async (uri: string): Promise<string> => {
        
    // 업로드 전에 리사이징
    const resized = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }],  // 가로 1080px로 줄이기
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
    )
    // resized.uri 를 업로드
    
    
    // 리사이징된 uri 기준으로 파일명, 타입 추출
    const filename = resized.uri.split('/').pop() ?? 'image.jpg'
    const contentType = 'image/jpeg'  // 리사이징 후 항상 JPEG



    // 백엔드에 presigned URL 요청
    const { data } = await api.post<{ presignedUrl: string; publicUrl: string }>(
      '/upload/presigned',
      { folder: 'images', filename, contentType, fileSize: 0 }
    )

    // 로컬 이미지를 base64로 읽기
    const response = await fetch(resized.uri)
    const blob = await response.blob()

    // S3에 직접 PUT 요청 - axios 대신 fetch 사용
    const uploadResponse = await fetch(data.presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: blob,
    })

    if (!uploadResponse.ok) {
      throw new Error(`S3 업로드 실패: ${uploadResponse.status}`)
    }


    return data.publicUrl
  }

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if(!permission.granted){
      Alert.alert('권한 필요', '사진 접근 권한이 필요합니다.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.5,
      exif: false
    })
    if(!result.canceled){
      setImage(result.assets[0].uri)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try{
      let cropImgUrl = ''
      if(image){
        cropImgUrl = await uploadImageToS3(image)
      }
      registerCrop({...crop, cropImg: cropImgUrl}, {
        onSuccess: () => router.back(),
        onError: (e) => console.log('농작물 등록 실패', e)
      })
    }catch(e) {
      Alert.alert('오류', '이미지 업로드에 실패했습니다.')
    }finally{
      setLoading(false)
    }
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

      <Text style={styles.label}>농작물 이미지</Text>
      <Pressable style={styles.imagePickerBtn} onPress={handlePickImage}>
        <Text style={styles.imagePickerText}>📷 이미지 선택</Text>
      </Pressable>

      {image ? (
        <Image source={{uri: image}} style={styles.previewImage}/>
      ) : null}

      <Pressable
        style={[styles.submitBtn, loading && {backgroundColor: '#aaa'}]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff"/>
          : <Text style={styles.submitText}>등록하기</Text>
        }
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
  imagePickerBtn: {
  borderWidth: 2,
  borderColor: '#ddd',
  borderStyle: 'dashed',
  borderRadius: 8,
  paddingVertical: 16,
  alignItems: 'center',
  marginBottom: 12,
  },
  imagePickerText: {
    color: '#888',
    fontSize: 14,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 16,
  },
})