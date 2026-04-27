import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { postApi } from '@/api/post.api'
import type { PostResponse } from '@/types/postType'
import PostFeedCard from '@/components/PostFeedCard'
import { AntDesign } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import FarmerBar from '@/components/farmer-bar'
import { getFollowList } from '@/api/follow.api'
import { getCurrentUserEmail } from '@/utils/auth1'

// 팔로우 타입 - follow.api 응답 구조에 맞게 정의
interface FollowItem {
  farmerEmail: string
  farmerNickname: string
  farmerProfileImg: string | null
}

const Home = () => {
  const router = useRouter()

  // 전체 게시글 목록
  const [posts, setPosts] = useState<PostResponse[]>([])

  // 구독 중인 농장 목록
  const [followList, setFollowList] = useState<FollowItem[]>([])

  // 현재 선택된 농장 이메일 (null이면 전체 게시글 표시)
  const [selectedFarmer, setSelectedFarmer] = useState<string | null>(null)

  // ── 구독 농장 목록 로드 ──
  // 로그인한 유저의 이메일로 팔로우 목록 조회
  // 앱 최초 실행 시 한 번만 실행 (빈 의존성 배열)
  useEffect(() => {
    const loadFollowList = async () => {
      try {
        const email = await getCurrentUserEmail()
        if (!email) return
        const data = await getFollowList(email)
        setFollowList(data)
      } catch (e) {
        console.error('팔로우 목록 오류', e)
      }
    }
    loadFollowList()
  }, [])

  // ── 게시글 목록 로드 ──
  // useFocusEffect: 화면에 포커스가 올 때마다 실행
  // 게시글 등록/수정 후 돌아왔을 때도 최신 목록 반영됨
  useFocusEffect(
    useCallback(() => {
      const loadPosts = async () => {
        const data = await postApi.getAll()
        setPosts(data)
      }
      loadPosts()
    }, [])
  )

  // ── 게시글 필터링 ──
  // selectedFarmer가 null이면 전체, 아니면 해당 농장주 게시글만
  const filteredPosts = selectedFarmer
    ? posts.filter((p) => p.memEmail === selectedFarmer)
    : posts

  return (
    <SafeAreaView style={styles.container}>

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id.toString()}
        // 상단에 구독 농장 바 고정
        ListHeaderComponent={
          <FarmerBar
            followList={followList}           // 구독 농장 목록
            selectedFarmer={selectedFarmer}   // 현재 선택된 농장
            onSelect={setSelectedFarmer}      // 농장 선택 시 호출
          />
        }
        renderItem={({ item }) => <PostFeedCard post={item} />}
      />

      {/* 게시글 등록 버튼 - 우하단 고정 */}
      <Pressable
        style={({ pressed }) => [styles.regBtn, pressed && styles.pressed]}
        onPress={() => router.push('/post/postRegister')}
      >
        <AntDesign name="plus" size={24} color="white" />
      </Pressable>

    </SafeAreaView>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  // 우하단 고정 등록 버튼
  regBtn: {
    position: 'absolute',
    width: 50,
    height: 50,
    bottom: 30,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 버튼 눌렸을 때 투명도
  pressed: {
    opacity: 0.8,
  },
})