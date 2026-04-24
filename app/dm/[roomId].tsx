import { dmApi } from '@/api/dm.api';
import { ChatMessageDTO, ChatRoomDTO } from '@/types/dmType';
import { getUserEmail } from '@/utils';
import { useSearchParams } from 'expo-router/build/hooks';
import { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native'

const formatTime = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  date.setHours(date.getHours() + 9);
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function DmRoom() {
  const {roomId} = useSearchParams<{roomId:string}>();
  const currentUserEmail = getUserEmail();
  const [messages, setMessages] = useState<ChatMessageDTO[]>([])
  const messagesEndRef = useRef(null);  

  // 메시지 목록 하단으로 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior : "smooth"})
  }


  return (
    <View>
      <Text>채팅방</Text>
    </View>
  )
}