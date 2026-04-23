import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View} from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView } from 'react-native'
import Input from '@/components/ui/Input'
import { useRouter } from 'expo-router'
import { postApi } from '@/api/post.api'

// 임시 이메일
const TEMP_EMAIL = 'farmer1'


const PostRegister = () => {

  const router = useRouter();

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  // 등록중 로딩상태(버튼 비활성화+스피너표시)
  const [loading, setLoading] = useState(false)


  const handleSubmit = async()=>{

    // 유효성 검사
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.')
      return
    }
    if (!content.trim()) {
      Alert.alert('알림', '내용 또는 이미지를 입력해주세요.')
      return
    }

    setLoading(true)
      try {
      // content JSON 생성 (이미지 없이 텍스트만)
      const contentJson = JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: { textAlign: null },
            content: [{ type: 'text', text: content }],
          },
        ],
      })

      // 게시글 등록 API 호출
      await postApi.create({
        title,
        content: contentJson,
        memEmail: TEMP_EMAIL,
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
    backgroundColor: '#4CAF50',
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
})