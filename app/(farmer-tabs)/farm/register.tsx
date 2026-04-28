import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { FarmRegisterData } from '@/types/farmType'
import { getUserEmail } from '@/utils/auth'
import { usePostFarmRegister } from '@/queries/farm/FarmRegister'
import { useRouter } from 'expo-router'
import DaumPostcode from 'react-native-daum-postcode'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import { Image, ActivityIndicator } from 'react-native'
import { api } from '@/utils/axios'

const FarmRegister = () => {

  const router = useRouter()

  const [image, setImage] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const [showPostcode, setShowPostcode] = useState(false)

  const [farm, setFarm] = useState<FarmRegisterData>({
    farmerEmail: '',
    farmName: '',
    farmAddr: '',
    farmDesc: '',
    farmImg: ''
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


    
    // // 로컬 uri를 blob으로 변환 후 S3에 PUT 요청
    // const imageBlob = await fetch(uri).then((r) => r.blob())
    // await axios.put(data.presignedUrl, imageBlob, {
    //   headers: { 'Content-Type': contentType },
    //   timeout: 60000,
    // })
    // 안쓰는 이유 : 이미지가 깨져보임 
    // blob으로 변환하는 부분 중 fetch로 로컬 uri를 blob으로 변환하면 제대로 안될때 있다.


    // // FormData 방식으로 변환 (RN에서 더 안정적)
    // const formData = new FormData()
    //   formData.append('file', {
    //     uri,
    //     name: filename,
    //     type: contentType,
    //   } as any)

    // // S3에 직접 PUT 요청
    // await fetch(data.presignedUrl, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': contentType },
    //   body: formData,
    // })
    // 게시글 등록 오류남. FormData 방식이 S3랑 안맞기때문. 


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

  const {mutate: registerFarm} = usePostFarmRegister()

  useEffect(() => {
    getUserEmail().then((email) => {
      setFarm(prev => ({...prev, farmerEmail: email ?? ''}))
    })
  }, [])

  const handlePickImage = async () => {
    // 수정
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
      let farmImgUrl = ''
      if(image) {
        farmImgUrl = await uploadImageToS3(image)
      }

      console.log('보내는 farmImgUrl:', farmImgUrl)  // ← 여기 추가
      console.log('보내는 farm 전체:', JSON.stringify({...farm, farmImg: farmImgUrl}))  // ← 여기 추가

      registerFarm({...farm, farmImg: farmImgUrl}, {
        onSuccess: () => router.back(),
        onError: (e) => console.log('농장 등록 실패', e)
      })
    }catch(e) {
      Alert.alert('오류', '이미지 업로드에 실패했습니다.')
    }finally{
      setLoading(false)
    }
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

      {/* 농장 이미지 */}
      <Text style={styles.label}>농장 대표 이미지</Text>
      <Pressable style={styles.imagePickerBtn} onPress={handlePickImage}>
        <Text style={styles.imagePickerText}>📷 이미지 선택</Text>
      </Pressable>

      {image ? (
        <Image source={{uri: image}} style={styles.previewImage}/>
      ): null}

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

      <Pressable
        style={[styles.submitBtn, loading && { backgroundColor: '#aaa' }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.submitText}>농장 등록하기</Text>
        }
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
    backgroundColor: '#6A9469',
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
    backgroundColor: '#6A9469',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center'
  },
  addrBtnText: {
    color: '#fff',
    fontWeight: 'bold'
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