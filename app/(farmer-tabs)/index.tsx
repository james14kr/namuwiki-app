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
    
      <SafeAreaView style={{flex : 1}}>
        <FlatList 
          // style={{flex : 1}}
          data={posts}
          keyExtractor={(item)=>item.id.toString()}
          // decelerationRate="normal"
          // initialNumToRender={5}
          // windowSize={5}
          renderItem={({item})=>{
            const imageUrl = getFirstImageUrl(item.content)
            return (
              <View style={styles.card}>
                {/* 이미지 영역 - 상대적 위치 기준 */}
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

                  {/* 프사 + 닉네임 - 이미지 위에 겹침 */}
                  <View style={styles.profileRow}>
                    <Image
                      source={
                        item.memProfileImg
                          ? { uri: item.memProfileImg }
                          : require('@/assets/images/default-profile.png')
                      }
                      style={styles.profileImg}
                    />
                    <Text style={styles.nickname}>{item.memNickname ?? '알 수 없음'}</Text>
                  </View>
                </View>

                {/* 제목 */}
                <Text style={styles.title}>{item.title}</Text>
              </View>
            )
          }}
        />

        

      </SafeAreaView>
    
    
  )
}

export default Home

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fff',
    // minHeight: 250,
  },
  imageWrapper: {
  position: 'relative',
},
profileRow: {
  position: 'absolute',
  top: 8,
  left: 8,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
},
profileImg: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: '#eee',
},
nickname: {
  fontSize: 15,
  fontWeight: '600',
  color: '#fff',
  textShadowColor: 'rgba(0,0,0,0.5)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 3,
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