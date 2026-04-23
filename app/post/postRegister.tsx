import { Pressable, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView } from 'react-native'
import Input from '@/components/ui/Input'
import { Ionicons } from '@expo/vector-icons'
import { string, url } from 'zod'
import { api } from '@/utils/axios'
import axios from 'axios'
import { useRouter } from 'expo-router'

// 임시 이메일
const TEMP_EMAIL = 'user1'

// S3 이미지 업로드
// 로컬 이미지 uri -> 백엔드에서 presigned URL 받기 -> S3에 업로드 -> publicUrl 반환
const uploadImageToS3 = async (uri : string): Promise<string> =>{
  // file:///data/user/0/.../image.jpg
  const filename = uri.split('/').pop() ?? 'image.jpg'
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg'
  const contentType = ext === 'png' ? 'image/png' : 'image/jpeg'

// 1단계: 백엔드에 presigned url 요청
// 백엔드가 s3에 업로드할수있는 임시 url을 발급
const {data} = await api.post<{presignedUrl : string; publicUrl: string}>(
  '/upload/presigned',
  {
    folder : 'imges', // s3 저장폴더
    filename,           // 파일명
    contentType,        // 파일 타입(image/jpeg 또는 image/png)
    fileSize : 0,
  }
)
// 2단계 : 로컬 uri를 blob으로 변환(s3 업로드에 필요한 형식)
const imageBlob = await fetch(uri).then((r)=>r.blob())

// 3단계 : presigned URL로 s3에 직접 put 요청(업로드)
await axios.put(data.presignedUrl, imageBlob, {
  headers : {'Content-Type': contentType},
  timeout : 60000,    // 60초 타임아웃
})
// 4단계 : s3에 저장된 pulbicUrl 반환 (이걸 db에 저장)
return data.publicUrl

}


// content JSON 생성 함수
// 웹 Tiptap 에디터와 동일한 JSON 형식으로 만들어야 웹이서도 RN에서도 같은 형식으로 읽을수 있음
const buildContent = (text:string, imageUrls:string[]): string=>{
  const nodes : any[] = []

  // 이미지 노드 먼저 추가 (이미지가 본문 위에 오도록)
  imageUrls.forEach((url)=>{
    nodes.push({
      type : 'image',
      attrs : {src :url, alt: '', title:'', width:null, height:null},
    })
  })
  // 텍스트 노드 추가
  if (text.trim()){
    nodes.push({
      type:'paragraph',
      atters:{textAlign:null},
      content:[{type:'text', text}]
    })
  }
  // 최종 JSON 문자열로 변환
  return JSON.stringify({type:'doc', content:nodes})


}


const PostRegister = () => {

  const router = useRouter();

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  // 이미지 로컬 uri 목록
  const [images, setImages] = useState<string[]>([])
  // 등록중 로딩상태(버튼 비활성화+스피너표시)
  const [loading, setLoading] = useState(false)






  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* 제목 */}
        <View>
          <Input
            style={styles.titleInput}
            placeholder='제목을 입력하세요'
          />
        
        </View>
      

        

       {/* 본문 */}
      <View>
        <Input 
          style={styles.contentInput}
          placeholder='본문을 입력하세요'
        />
      </View>

      <Pressable>
        <Text>등록</Text>
      </Pressable>


      </ScrollView>
    </SafeAreaView>
  )
}

export default PostRegister

const styles = StyleSheet.create({
  container : {
    flex : 1,

  },
  titleInput : {
    
  },
  contentInput : {
    
  },
})