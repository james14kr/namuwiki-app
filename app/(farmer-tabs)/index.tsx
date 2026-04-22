import React, { useEffect, useState } from 'react'
import { FlatList, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { postApi } from '@/api/post.api'
import type { PostResponse } from '@/types/postType'
import PostFeedCard from '@/components/PostFeedCard'

const Home = () => {
  const [posts, setPosts] = useState<PostResponse[]>([])

  useEffect(() => {
    const loadPosts = async () => {
      const data = await postApi.getAll()
      setPosts(data)
    }
    loadPosts()
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostFeedCard
            post={item}
            initialLiked={false}
            initialLikeCount={0}
          />
        )}
      />
    </SafeAreaView>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
})