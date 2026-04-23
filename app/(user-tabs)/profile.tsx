import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { getUserEmail } from '@/utils'
import { MemInfoDTO } from '@/types/memberType'
import { memberApi } from '@/api/memberApi'
import Input from '@/components/ui/Input'
import * as ImagePicker from 'expo-image-picker';

const Profile = () => {

  const router = useRouter()
  const currentUserEmail = getUserEmail();

  const [memInfo, setMemInfo] = useState<MemInfoDTO>({} as MemInfoDTO);
  const [profileImg, setProfileImg] = useState<string>("");
  const inputRef = useRef(null);



  useEffect(()=>{
    if (!currentUserEmail) return;
    memberApi.getMemInfo(currentUserEmail).then((data)=>{
      setMemInfo(data);
      setProfileImg(data.memProfileImg ?? "");
    });
  }, [currentUserEmail]);



  const initial = memInfo.memNickname?.charAt(0)?.toUpperCase() ?? "?";



  // useRef 변수를 태그에 ref속성에 넣으면 해당 element 값을 가지고 있을 수 있게 됨
  // element에 click이벤트를 강제 호출
  const handleClickEvent = () => {
    if (!inputRef || inputRef.current === null) return;

    (inputRef.current as HTMLInputElement).click();
  };

  const handleChangeEvent = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files === null) return;
    const file = e.target.files[0];

    // Presigned URL 방식으로 S3에 이미지 업로드 하는 api
    const publicURL = await uploadImage(file, "my-page");
    setProfileImg(publicURL);

    // DB에 프로필 저장 url
    if(currentUserEmail){
      await memberApi.updateProfileImg(currentUserEmail, publicURL);
      setMemInfo((prev)=>({
        ...prev
        , memProfileImg : publicURL
      }));
    }
  };

  const handleLogout = () => {
    router.replace('/(auth)/login'as any)
  }
   
  return (
    <View style={styles.container}>
      <Text style={styles.title}>프로필</Text>
      <Input
            id="input"
            ref={inputRef}
            type="expo-image-picker"
            onChangeText={handleChangeEvent}
          />
      <View>
        <Text>
          {memInfo.memNickname || "닉네임"}
        </Text>
        <Text>{memInfo.memRole === "USER" ? "일반 유저" : "나무위키 농장주"}</Text>
      </View>


      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>로그아웃</Text>
      </TouchableOpacity>

    </View>
  )
}

export default Profile

const styles = StyleSheet.create({
   container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32
  },
  button: {
    backgroundColor: '#ff4444',
    padding: 14,
    borderRadius: 8,
    width: 200,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
})