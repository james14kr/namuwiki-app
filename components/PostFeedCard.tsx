import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native'
import { useRouter } from 'expo-router'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import type { PostResponse } from '@/types/postType'
import { postApi } from '@/api/post.api'
import Entypo from '@expo/vector-icons/Entypo';
import { getCurrentUserEmail } from '@/utils/auth1'



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

// content JSON에서 텍스트만 추출
const getTextContent = (content: string): string => {
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

// 날짜 포맷
const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

interface Props {
  post: PostResponse
  initialLiked?: boolean
  initialLikeCount?: number
}

const PostFeedCard = ({ post, initialLiked = false, initialLikeCount = 0 }: Props) => {
  const router = useRouter()
  const imageUrl = getFirstImageUrl(post.content)
  const textContent = getTextContent(post.content)

  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [expanded, setExpanded] = useState(false)

  // 자신이 쓴 게시물말 수정 삭제 권한
  const [currentEmail, setCurrentEmail] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUserEmail().then(setCurrentEmail)
  }, [])



  // 좋아요 토글
  const handleLike = async () => {
    try {
      await postApi.toggleLike(post.id, currentEmail ?? '')
      const newLiked = !liked
      setLiked(newLiked)
      setLikeCount((prev) => prev + (newLiked ? 1 : -1))
    } catch (e) {
      console.error('좋아요 오류', e)
    }
  }

  // 이미지 클릭 상세 이동
  const handleImagePress = () => {
    router.push(`/post/${post.id}` as any)
  }

  return (
    <View style={styles.card}>

      {/* 이미지 + 프사/닉네임 겹치기 */}
      <Pressable onPress={handleImagePress}>
        <View style={styles.imageWrapper}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode='cover'
            />
          ) : (
            <View style={styles.noImage}>
              <Text style={styles.noImageText}>이미지 없음</Text>
            </View>
          )}

          {/* 프사 + 닉네임 - 이미지 좌상단 겹침 */}
          <View style={styles.profileRow}>
            <Image
              source={
                post.memProfileImg
                  ? { uri: post.memProfileImg }
                  : require('@/assets/images/default-profile.png')
              }
              style={styles.profileImg}
            />
            <Text style={styles.nickname}>{post.memNickname ?? '알 수 없음'}</Text>
          </View>
        </View>
      </Pressable>

      {/* 제목 + 더보기 */}
      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={1}>{post.title}</Text>
        <Pressable onPress={() => setExpanded((prev) => !prev)}>
          <Text style={styles.moreBtn}>{expanded ? '접기' : '더보기'}</Text>
        </Pressable>
      </View>

      {/* 더보기 펼쳤을 때 본문 */}
      {expanded && (
        <Text style={styles.content}>{textContent}</Text>
      )}

      {/* 업로드 날짜 */}
      <Text style={styles.date}>{formatDate(post.createdAt)}</Text>

      {/* 좋아요 + 댓글수 */}
      <View style={styles.footerRow}>
        <Pressable style={styles.footerItem} onPress={handleLike}>
          
          <Entypo 
            name={liked ? 'heart' : 'heart-outlined'} 
            size={24} 
            color={liked ? '#e74c3c' : '#888'} 
          />
          <Text style={styles.footerCount}>{likeCount}</Text>
        </Pressable>

        <Pressable
          style={styles.footerItem}
          onPress={handleImagePress}
        >
          <Ionicons name='chatbubble-outline' size={20} color='#888' />
          <Text style={styles.footerCount}>{post.commentCount ?? 0}</Text>
        </Pressable>
      </View>

    </View>
  )
}

export default PostFeedCard

const styles = StyleSheet.create({
  card: {
    marginBottom: 40,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 220,
  },
  noImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    color: '#aaa',
    fontSize: 13,
  },
  profileRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  nickname: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    marginRight: 8,
  },
  moreBtn: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 6,
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  date: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 4,
    fontSize: 11,
    color: '#aaa',
  },
  footerRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerCount: {
    fontSize: 13,
    color: '#888',
  },
})
