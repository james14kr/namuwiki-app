import { FlatList, StyleSheet, Text, View, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { PostResponse } from '@/types/postType';
import { postApi } from '@/api/post.api';
import { SafeAreaView } from 'react-native-safe-area-context';


// content JSON에서 첫 번째 이미지 URL 추출
const getFirstImageUrl = (content: string): string | null => {
  try {
    const parsed = JSON.parse(content)
    const imageNode = parsed.content?.find(
      (node: any) => node.type === 'image'
    )
    return imageNode?.attrs?.src ?? null
  } catch {
    return null
  }
}



const Home = () => {

  const [posts, setPosts] = useState<PostResponse[]>([]);

  useEffect(()=>{
    const loadPosts = async ()=>{
      const data = await postApi.getAll()
      // console.log(`게시글 목록 : `, data)
      setPosts(data)
    }
    loadPosts()
  },[])


  return (
    <>
      <SafeAreaView>
        <FlatList 
          data={posts}
          keyExtractor={(item)=>item.id.toString()}
          renderItem={({item})=>{
            const imageUrl = getFirstImageUrl(item.content)
            return (
              <View style={styles.card}>
                <Text style={styles.title}>
                  {item.title}
                </Text>
                {
                  imageUrl 
                  ?
                  (
                    <Image 
                      source={{uri:imageUrl}}
                      style={styles.image} 
                    />
                  ) 
                  : 
                  (
                    <View style={styles.noImage}>
                      <Text style={styles.noImageText}>이미지 없음</Text>
                    </View>
                  )}
              </View>
            )
          }}
        />

        <View>
          <Text>게시글 수 : {posts.length}</Text>
        </View>

      </SafeAreaView>
    
    </>
  )
}

export default Home

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  noImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    color: '#aaa',
  },
})