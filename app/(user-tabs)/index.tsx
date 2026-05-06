import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { postApi } from '@/api/post.api'
import type { PostResponse } from '@/types/postType'
import PostFeedCard from '@/components/PostFeedCard'
import { AntDesign } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import FarmerBar from '@/components/farmer-bar'
import { getCurrentUserEmail } from '@/utils/auth1'
import { useGetFollowList } from '@/queries/follow.queries'

// 팔로우 타입 - follow.api 응답 구조에 맞게 정의
interface FollowItem {
  farmerEmail: string
  farmerNickname: string
  farmerProfileImg: string | null
}

const PAGE_SIZE = 5

const Home = () => {
  const router = useRouter()

  // 전체 게시글 목록
  const [posts, setPosts] = useState<PostResponse[]>([])

  // 현재 선택된 농장 이메일 (null이면 전체 게시글 표시)
  const [selectedFarmer, setSelectedFarmer] = useState<string | null>(null)

  // 현재 보여줄 게시글 수
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)

  const [currentEmail, setCurrentEmail] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUserEmail().then(setCurrentEmail)
  }, [])

  const {data: followList = []} = useGetFollowList(currentEmail ?? '')

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
  // 해당 수만큼 잘라서 보여주기 (무한스크롤)
  const filteredPosts = (selectedFarmer
    ? posts.filter((p) => p.memEmail === selectedFarmer)
    : posts
  ).slice(0, displayCount)  // 

  // 해당 수만큼 피드 불러오기
  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + PAGE_SIZE)
  }


  return (
    <SafeAreaView style={styles.container}>

      {/* // 상단에 구독 농장 바 고정 */}
      
      <FarmerBar
        followList={followList}           // 구독 농장 목록
        selectedFarmer={selectedFarmer}   // 현재 선택된 농장
        onSelect={(email)=>{
          setSelectedFarmer(email)
          setDisplayCount(PAGE_SIZE)  // 농장 바꾸면 5개로 초기화
        }}

      />
      
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 12 }}
        renderItem={({ item }) => <PostFeedCard post={item} />}

        // 스크롤 끝에 도달 시 호출
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
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
    backgroundColor: '#6A9469',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 버튼 눌렸을 때 투명도
  pressed: {
    opacity: 0.8,
  },
})