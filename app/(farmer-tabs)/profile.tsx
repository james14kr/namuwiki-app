import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import * as SecureStore from 'expo-secure-store'
import { Ionicons } from '@expo/vector-icons'
import { memberApi } from '@/api/memberApi'
import type { MemInfoDTO } from '@/types/memberType'
import type { PostResponse } from '@/types/postType'
import type { CommentResponse } from '@/types/commentType'
import { getCurrentUserEmail } from '@/utils/auth1'
import { api } from '@/utils/axios'

// S3 이미지 업로드
const uploadImageToS3 = async (uri: string): Promise<string> => {
  const resized = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 400 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  )
  const filename = resized.uri.split('/').pop() ?? 'profile.jpg'
  const contentType = 'image/jpeg'

  const { data } = await api.post<{ presignedUrl: string; publicUrl: string }>(
    '/upload/presigned',
    { folder: 'my-page', filename, contentType, fileSize: 0 }
  )

  const response = await fetch(resized.uri)
  const blob = await response.blob()

  const uploadResponse = await fetch(data.presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
  })

  if (!uploadResponse.ok) throw new Error('S3 업로드 실패')
  return data.publicUrl
}

// 날짜 포맷
const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

// content JSON에서 첫 번째 이미지 URL 추출
const getFirstImageUrl = (content: string): string | null => {
  try {
    const parsed = JSON.parse(content)
    const imageNode = parsed.content?.find((node: any) => node.type === 'image')
    return imageNode?.attrs?.src ?? null
  } catch {
    return null
  }
}

export default function Profile() {
  const router = useRouter()
  const [memInfo, setMemInfo] = useState<MemInfoDTO | null>(null)
  const [myPosts, setMyPosts] = useState<PostResponse[]>([])
  const [myComments, setMyComments] = useState<CommentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  // 활동기록 탭 (posts / comments)
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts')

  useEffect(() => {
    const load = async () => {
      try {
        const email = await getCurrentUserEmail()
        if (!email) return
        const [info, posts, comments] = await Promise.all([
          memberApi.getMemInfo(email),
          memberApi.getMyPosts(email),
          memberApi.getMyComments(email),
        ])
        setMemInfo(info)
        setMyPosts(posts)
        setMyComments(comments)
      } catch (e) {
        console.error('마이페이지 로드 오류', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // 프로필 이미지 변경
  const handlePickProfileImg = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('권한 필요', '사진 접근 권한이 필요합니다.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
    })

    if (result.canceled) return

    setUploading(true)
    try {
      const uri = result.assets[0].uri
      const publicUrl = await uploadImageToS3(uri)
      const email = await getCurrentUserEmail()
      if (!email) return
      await memberApi.updateProfileImg(email, publicUrl)
      setMemInfo((prev) => prev ? { ...prev, memProfileImg: publicUrl } : prev)
      Alert.alert('완료', '프로필 이미지가 변경됐습니다.')
    } catch (e) {
      Alert.alert('오류', '프로필 이미지 변경에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  // 로그아웃
  const handleLogout = async () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await SecureStore.deleteItemAsync('accessToken')
          router.replace('/(auth)/login' as any)
        },
      },
    ])
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6A9469" style={{ marginTop: 100 }} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* 프로필 히어로 배너 */}
        <View style={styles.heroBanner}>
          <Pressable onPress={handlePickProfileImg} style={styles.avatarWrapper}>
            {uploading ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : memInfo?.memProfileImg ? (
              <Image source={{ uri: memInfo.memProfileImg }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>
                  {memInfo?.memNickname?.[0]?.toUpperCase() ?? '?'}
                </Text>
              </View>
            )}
            {/* 카메라 아이콘 */}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </Pressable>
          <Text style={styles.heroNickname}>{memInfo?.memNickname ?? '닉네임'}</Text>
          <Text style={styles.heroRole}>
            {memInfo?.memRole === 'FARMER' ? '🌱 농장주' : memInfo?.memRole === 'ADMIN' ? '👑 관리자' : '🌿 일반 회원'}
          </Text>
        </View>

        {/* 기본 정보 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👤 내 프로필</Text>
          <InfoRow icon="person-outline" label="이름" value={memInfo?.memName} />
          <InfoRow icon="call-outline" label="전화번호" value={memInfo?.memTel} />
          <InfoRow icon="mail-outline" label="이메일" value={memInfo?.memEmail} />
          <InfoRow icon="location-outline" label="주소" value={memInfo?.memAdd} />
          <InfoRow icon="calendar-outline" label="가입일" value={memInfo?.memJoinDate ? formatDate(memInfo.memJoinDate) : ''} />
        </View>

        {/* 내 활동 기록 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 내 활동 기록</Text>

          {/* 탭 */}
          <View style={styles.tabRow}>
            <Pressable
              style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
              onPress={() => setActiveTab('posts')}
            >
              <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
                게시글 {myPosts.length}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === 'comments' && styles.tabActive]}
              onPress={() => setActiveTab('comments')}
            >
              <Text style={[styles.tabText, activeTab === 'comments' && styles.tabTextActive]}>
                댓글 {myComments.length}
              </Text>
            </Pressable>
          </View>

          {/* 내가 쓴 게시글 목록 */}
          {activeTab === 'posts' && (
            myPosts.length === 0 ? (
              <Text style={styles.emptyText}>작성한 게시글이 없습니다.</Text>
            ) : (
              myPosts.map((post) => (
                <Pressable
                  key={post.id}
                  style={styles.activityItem}
                  onPress={() => router.push(`/post/${post.id}` as any)}
                >
                  {/* 대표 이미지 */}
                  {getFirstImageUrl(post.content) ? (
                    <Image
                      source={{ uri: getFirstImageUrl(post.content)! }}
                      style={styles.activityThumb}
                    />
                  ) : (
                    <View style={[styles.activityThumb, styles.activityThumbEmpty]}>
                      <Ionicons name="image-outline" size={20} color="#ccc" />
                    </View>
                  )}
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle} numberOfLines={1}>{post.title}</Text>
                    <Text style={styles.activityDate}>{formatDate(post.createdAt)}</Text>
                    <View style={styles.activityMeta}>
                      <Ionicons name="heart-outline" size={12} color="#aaa" />
                      <Text style={styles.activityMetaText}>{post.likeCount ?? 0}</Text>
                      <Ionicons name="chatbubble-outline" size={12} color="#aaa" style={{ marginLeft: 8 }} />
                      <Text style={styles.activityMetaText}>{post.commentCount ?? 0}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#ccc" />
                </Pressable>
              ))
            )
          )}

          {/* 내가 쓴 댓글 목록 */}
          {activeTab === 'comments' && (
            myComments.length === 0 ? (
              <Text style={styles.emptyText}>작성한 댓글이 없습니다.</Text>
            ) : (
              myComments.map((comment) => (
                <Pressable
                  key={comment.id}
                  style={styles.activityItem}
                  onPress={() => router.push(`/post/${comment.postId}` as any)}
                >
                  <View style={styles.commentIconWrapper}>
                    <Ionicons name="chatbubble-outline" size={20} color="#6A9469" />
                  </View>
                  <View style={styles.activityContent}>
                    {/* 어느 게시글에 단 댓글인지 */}
                    <Text style={styles.commentPostTitle} numberOfLines={1}>
                      📄 {comment.postTitle ?? '게시글'}
                    </Text>
                    <Text style={styles.activityTitle} numberOfLines={2}>{comment.content}</Text>
                    <Text style={styles.activityDate}>{formatDate(comment.createdAt)}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#ccc" />
                </Pressable>
              ))
            )
          )}
        </View>

        {/* 로그아웃 버튼 */}
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#e74c3c" />
          <Text style={styles.logoutText}>로그아웃</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  )
}

// 정보 행 컴포넌트
const InfoRow = ({ icon, label, value }: { icon: any; label: string; value?: string }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={16} color="#888" />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || '—'}</Text>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // 히어로 배너
  heroBanner: {
    backgroundColor: '#6A9469',
    paddingVertical: 36,
    alignItems: 'center',
    gap: 8,
  },
  avatarWrapper: {
    position: 'relative',
    width: 90,
    height: 90,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#333',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroNickname: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  heroRole: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },

  // 카드
  card: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },

  // 정보 행
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 8,
  },
  infoLabel: {
    width: 70,
    fontSize: 13,
    color: '#888',
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },

  // 탭
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#6A9469',
  },
  tabText: {
    fontSize: 14,
    color: '#aaa',
  },
  tabTextActive: {
    color: '#6A9469',
    fontWeight: '700',
  },

  // 활동 아이템
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 10,
  },
  activityThumb: {
    width: 52,
    height: 52,
    borderRadius: 6,
  },
  activityThumbEmpty: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
    gap: 2,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  activityDate: {
    fontSize: 11,
    color: '#aaa',
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  activityMetaText: {
    fontSize: 11,
    color: '#aaa',
  },
  commentIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 6,
    backgroundColor: '#f0f9f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentPostTitle: {
    fontSize: 11,
    color: '#6A9469',
    marginBottom: 2,
  },

  // 빈 상태
  emptyText: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 13,
    paddingVertical: 20,
  },

  // 로그아웃
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  logoutText: {
    color: '#e74c3c',
    fontSize: 15,
    fontWeight: '600',
  },
})