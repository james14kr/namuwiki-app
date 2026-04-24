import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { postApi } from '@/api/post.api'
import type { PostResponse } from '@/types/postType'
import PostFeedCard from '@/components/PostFeedCard'
import { AntDesign } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'

const Home = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<PostResponse[]>([]);



  useFocusEffect(
    useCallback(()=>{
      const loadPosts = async () => {
        const data = await postApi.getAll()
        setPosts(data)
      }
      loadPosts()
    },[])
  )


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

      <Pressable
      style={({pressed}) => [styles.regBtn, pressed && styles.pressed]}

        onPress={e => router.push('/post/postRegister')}
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
  registerBtn:{
    alignSelf : 'flex-start',
    margin : 12,
    backgroundColor : '#4CAF50',
    padding : 20,
    paddingVertical : 6,
    borderRadius : 50

  },
  registerText:{
    color : 'white',
    fontWeight : 'bold',
    fontSize : 30
  },
  regBtn: {
    position: 'absolute',
    width: 50,
    height: 50,
    bottom: 30,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pressed: {
    opacity: 0.8
  }
})