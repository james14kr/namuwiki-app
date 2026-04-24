import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Input from '@/components/ui/Input'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import { api } from '@/utils/axios'
import { postApi } from '@/api/post.api'
import { Ionicons } from '@expo/vector-icons'
import { getCurrentUserEmail } from '@/utils/auth1'



// content JSON에서 텍스트만 추출 (기존 본문 불러올 때 사용)
const getTextFromContent = (content: string): string => {
  try {
    const parsed = JSON.parse(content)
    return parsed.content
      ?.flatMap((node: any) =>
        node.content?.map((c: any) => c.text ?? '') ?? []
      )
      .join(' ') ?? ''
  } catch {
    return content
  }
}

// content JSON에서 기존 이미지 URL 추출
const getImagesFromContent = (content: string): string[] => {
  try {
    const parsed = JSON.parse(content)
    return parsed.content
      ?.filter((node: any) => node.type === 'image')
      .map((node: any) => node.attrs?.src ?? '') ?? []
  } catch {
    return []
  }
}

// S3 이미지 업로드
const uploadImageToS3 = async (uri: string): Promise<string> => {
  // 이미 S3 URL이면 그대로 반환 (기존 이미지)
  if (uri.startsWith('https://')) return uri

  // 새로 선택한 이미지면 리사이징 후 업로드
  const resized = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1080 } }],
    { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
  )

  const filename = resized.uri.split('/').pop() ?? 'image.jpg'
  const contentType = 'image/jpeg'

  const { data } = await api.post<{ presignedUrl: string; publicUrl: string }>(
    '/upload/presigned',
    { folder: 'images', filename, contentType, fileSize: 0 }
  )

  const response = await fetch(resized.uri)
  const blob = await response.blob()

  const uploadResponse = await fetch(data.presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
  })

  if (!uploadResponse.ok) {
    throw new Error(`S3 업로드 실패: ${uploadResponse.status}`)
  }

  return data.publicUrl
}

export default function PostEdit() {
  const { postId } = useLocalSearchParams<{ postId: string }>()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  // 이미지 목록 - S3 URL(기존) + 로컬 uri(새로 추가) 혼합
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)


  // 자신이 쓴 게시물말 수정 삭제 권한
  const [currentEmail, setCurrentEmail] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUserEmail().then(setCurrentEmail)
  }, [])


  // 기존 게시글 데이터 불러오기
  useEffect(() => {
    const loadPost = async () => {
      try {
        const post = await postApi.getOne(postId)
        setTitle(post.title)
        setContent(getTextFromContent(post.content))
        setImages(getImagesFromContent(post.content))
      } catch (e) {
        Alert.alert('오류', '게시글을 불러오지 못했습니다.')
        router.back()
      } finally {
        setInitialLoading(false)
      }
    }
    loadPost()
  }, [postId])

  // 갤러리에서 이미지 추가
  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('권한 필요', '사진 접근 권한이 필요합니다.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.5,
      exif: false,
    })

    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri)
      setImages((prev) => [...prev, ...uris])
    }
  }

  // 이미지 제거
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  // 수정 제출
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
      // 이미지 동시 업로드 (기존 S3 URL은 그대로, 새 이미지만 업로드)
      const uploadedUrls = await Promise.all(
        images.map((uri) => uploadImageToS3(uri))
      )

      // content JSON 생성
      const nodes: any[] = []

      uploadedUrls.forEach((url) => {
        nodes.push({
          type: 'image',
          attrs: { src: url, alt: '', title: '', width: null, height: null },
        })
      })

      if (content.trim()) {
        nodes.push({
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [{ type: 'text', text: content }],
        })
      }

      const contentJson = JSON.stringify({ type: 'doc', content: nodes })

      // 수정 API 호출
      await postApi.update({
        id: Number(postId),
        title,
        content: contentJson,
      })

      Alert.alert('완료', '게시글이 수정되었습니다.', [
        { text: '확인', onPress: () => router.back() },
      ])
    } catch (e) {
      console.error('수정 오류', e)
      Alert.alert('오류', '게시글 수정에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 초기 로딩 중
  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 100 }} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* 헤더 */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#333" />
          </Pressable>
          <Text style={styles.headerTitle}>게시글 수정</Text>
        </View>

        {/* 제목 */}
        <Text style={styles.label}>제목</Text>
        <Input
          style={styles.titleInput}
          placeholder='제목을 입력하세요'
          value={title}
          onChangeText={setTitle}
        />

        {/* 이미지 선택 버튼 */}
        <Text style={styles.label}>이미지</Text>
        <Pressable style={styles.imagePickerBtn} onPress={handlePickImage}>
          <Text style={styles.imagePickerText}>📷 이미지 추가</Text>
        </Pressable>

        {/* 이미지 미리보기 */}
        {images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.previewScroll}
          >
            {images.map((uri, idx) => (
              <View key={idx} style={styles.previewItem}>
                <Image source={{ uri }} style={styles.previewImage} />
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
        <Text style={styles.label}>본문</Text>
        <Input
          style={styles.contentInput}
          placeholder='본문을 입력하세요'
          value={content}
          onChangeText={setContent}
          multiline
        />

        {/* 수정 버튼 */}
        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.submitBtn, loading && { backgroundColor: '#aaa' }]}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>수정하기</Text>
          }
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  )
}

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
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    marginTop: 16,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  imagePickerBtn: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
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
  submitBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 28,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})