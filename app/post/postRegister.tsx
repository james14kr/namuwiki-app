import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'  // 이미지 선택 import
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView } from 'react-native'
import Input from '@/components/ui/Input'
import { useRouter } from 'expo-router'
import { postApi } from '@/api/post.api'
import { api } from '@/utils/axios'
import * as ImageManipulator from 'expo-image-manipulator'
import { getCurrentUserEmail } from '@/utils/auth1'






const PostRegister = () => {

  const router = useRouter();

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  // 등록중 로딩상태(버튼 비활성화+스피너표시)
  const [loading, setLoading] = useState(false)
  // 선택된 이미지 로컬 uri 목록
  const [images, setImages] = useState<string[]>([])

// 자신이 쓴 게시물말 수정 삭제 권한
  const [currentEmail, setCurrentEmail] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUserEmail().then(setCurrentEmail)
  }, [])

  //선택된 프리셋 해시태그 목록
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  //직접 입력 중인 태그
  const [customTag, setCustomTag] = useState('')

  const [category, setCategory] = useState<'농업인' | '소비자' | ''>('')

  const PRESET_TAGS = [
    '#스마트팜', '#질문', '#팁공유', '#수확',
    '#병충해', '#기기관리', '#날씨', '#소비자후기'  
  ]

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }



//////////     이미지     ////////////////////////
  



  // S3 presigned URL 방식으로 이미지 업로드
  // 흐름: 로컬 uri → 백엔드에서 presigned URL 받기 → S3에 직접 업로드 → publicUrl 반환
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



  // 갤러리에서 이미지 선택
  const handlePickImage = async () => {
    // 갤러리 접근 권한 요청
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('권한 필요', '사진 접근 권한이 필요합니다.')
      return
    }

    // 여러 장 선택 가능, 품질 80% 압축
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.5,   // 0.8일땐 업로드속도 2MB당 5초, 0.5일땐 2MB당 2초
      exif : false,
    })

    // 취소 안했으면 uri 목록에 추가
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri)
      setImages((prev) => [...prev, ...uris])
    }
  }

  // 선택된 이미지 제거
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

//////////////////////////////////////////////////





  const handleSubmit = async () => {
  if (!title.trim()) {
    Alert.alert('알림', '제목을 입력해주세요.')
    return
  }
  if (!content.trim() && images.length === 0) {
    Alert.alert('알림', '내용 또는 이미지를 입력해주세요.')
    return
  }

  setLoading(true)
  try {
    // // 1단계: 선택된 이미지들 S3에 순서대로 업로드
    // const uploadedUrls: string[] = []
    // for (const uri of images) {
    //   const url = await uploadImageToS3(uri)
    //   uploadedUrls.push(url)
    // }
    // 업로드 시간 너무 오래 걸림, 2MB당 거의 8~10초



    // 1단계 : 이미지 동시에 업로드(Promise.all)
    const uploadedUrls = await Promise.all(
      images.map((uri) => uploadImageToS3(uri))
    )
    // promise.all 써서 2MB당 거의 5초로 단축
    

    // 2단계: 이미지 노드 + 텍스트 노드로 content JSON 생성
    const nodes: any[] = []

    // 이미지 노드 (웹 Tiptap이랑 동일한 형식)
    uploadedUrls.forEach((url) => {
      nodes.push({
        type: 'image',
        attrs: { src: url, alt: '', title: '', width: null, height: null },
      })
    })

    // 텍스트 노드
    if (content.trim()) {
      nodes.push({
        type: 'paragraph',
        attrs: { textAlign: null },
        content: [{ type: 'text', text: content }],
      })
    }

    const contentJson = JSON.stringify({ type: 'doc', content: nodes })

    // 3단계: 게시글 등록 API 호출
    // ✅ 수정
    await postApi.create({
      title,
      content: contentJson,
      memEmail: currentEmail,
      hashtags: selectedTags.join(' ') || undefined,
      category: category || undefined,
    })

    Alert.alert('완료', '게시글이 등록되었습니다.', [
      { text: '확인', onPress: () => router.back() },
      ])
    } catch (e) {
      console.error('등록 오류', e)
      Alert.alert('오류', '게시글 등록에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }



  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>게시글 작성</Text>
        </View>
        
        
        {/* 제목 */}
        <View>
          <Input
            style={styles.titleInput}
            placeholder='제목을 입력하세요'
            value={title}
            onChangeText={setTitle}
          />
        
        </View>
      
        {/* 이미지 선택 버튼 */}
        <Pressable style={styles.imagePickerBtn} onPress={handlePickImage}>
          <Text style={styles.imagePickerText}>📷 이미지 추가</Text>
        </Pressable>

        {/* 선택된 이미지 미리보기 - 가로 스크롤 */}
        {images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.previewScroll}
          >
            {images.map((uri, idx) => (
              <View key={idx} style={styles.previewItem}>
                {/* 선택된 이미지 미리보기 */}
                <Image source={{ uri }} style={styles.previewImage} />
                {/* X 버튼으로 이미지 제거 */}
                <Pressable
                  style={styles.removeBtn}
                  onPress={() => handleRemoveImage(idx)}
                >
                  <Text style={styles.removeBtnText}>✕</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}
        

        {/* 본문 */}
        <View>
          <Input 
            style={styles.contentInput}
            placeholder='본문을 입력하세요'
            value={content}
            onChangeText={setContent}
            multiline // 여러줄 작성
          />
        </View>

        {/* 해시태그 */}
        <Text style={styles.tagLabel}>해시태그</Text>

        {/* 프리셋 태그 */}
        <View style={styles.tagPresetRow}>
          {PRESET_TAGS.map(tag => (
            <Pressable
              key={tag}
              style={[styles.tagChip, selectedTags.includes(tag) && styles.tagChipActive]}
              onPress={() => toggleTag(tag)}
            >
              <Text style={[styles.tagChipText, selectedTags.includes(tag) && styles.tagChipTextActive]}>
                {tag}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 직접 입력 */}
        <View style={styles.customTagRow}>
          <Input
            style={styles.customTagInput}
            placeholder='직접 입력 (예: #토마토)'
            value={customTag}
            onChangeText={setCustomTag}
          />
          <Pressable
            style={styles.customTagAddBtn}
            onPress={() => {
              const trimmed = customTag.trim()
              if (!trimmed) return
              const tag = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
              if (!selectedTags.includes(tag)) {
                setSelectedTags(prev => [...prev, tag])
              }
              setCustomTag('')
            }}
          >
            <Text style={styles.customTagAddText}>추가</Text>
          </Pressable>
        </View>

        {/* 선택된 태그 미리보기 */}
        {selectedTags.length > 0 && (
          <View style={styles.selectedTagRow}>
            {selectedTags.map(tag => (
              <Pressable key={tag} style={styles.selectedChip} onPress={() => toggleTag(tag)}>
                <Text style={styles.selectedChipText}>{tag} ✕</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* 카테고리 */}
        <Text style={styles.tagLabel}>카테고리</Text>
        <View style={styles.categoryRow}>
          {(['농업인', '소비자'] as const).map((cat) => (
            <Pressable
              key={cat}
              style={[styles.tagChip, category === cat && styles.tagChipActive]}
              onPress={() => setCategory(prev => prev === cat ? '' : cat)}
            >
              <Text style={[styles.tagChipText, category === cat && styles.tagChipTextActive]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </View>

      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        style={[styles.registerBtn, loading && {backgroundColor : '#aaa'}]}
      >
        {
          loading
          ?
          <ActivityIndicator color="#4CAF50" />
          :
          <Text
            style={styles.registerText}
          >등록</Text>
        }
      </Pressable>


      </ScrollView>
    </SafeAreaView>
  )
}

export default PostRegister

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },
  
  titleInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#fafafa',
    marginBottom : 10,
  },

  imagePickerBtn: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom : 15,
  },
  imagePickerText: {
    color: '#888',
    fontSize: 14,
  },
  previewScroll: {
    marginTop: 12,
  },
  previewItem: {
    position: 'relative',  
    marginRight: 10,
    marginBottom: 20,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#e74c3c',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },


  contentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#fafafa',
    height: 200,
    textAlignVertical: 'top',
  },
  registerBtn: {
    backgroundColor: '#6A9469',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 28,
  },
  registerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tagLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 12 },
  tagPresetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  tagChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  tagChipActive: { backgroundColor: '#6A9469', borderColor: '#6A9469' },
  tagChipText: { fontSize: 13, color: '#666' },
  tagChipTextActive: { color: '#fff', fontWeight: '600' },
  customTagRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  customTagInput: {
    flex: 1, borderWidth: 1, borderColor: '#e0e0e0',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
    fontSize: 14, backgroundColor: '#fafafa',
  },
  customTagAddBtn: {
    backgroundColor: '#6A9469', borderRadius: 8,
    paddingHorizontal: 16, justifyContent: 'center',
  },
  customTagAddText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  selectedTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  selectedChip: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, backgroundColor: '#e8f5e8',
  },
  selectedChipText: { fontSize: 12, color: '#2C4A2C', fontWeight: '600' },
  categoryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
})