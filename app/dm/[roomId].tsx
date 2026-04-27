import { dmApi } from "@/api/dm.api";
import Input from "@/components/ui/Input";
import { ChatMessageDTO } from "@/types/dmType";
import { getUserEmail } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { Client } from "@stomp/stompjs";
import { useLocalSearchParams, useRouter } from "expo-router/build/hooks";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SockJS from "sockjs-client";

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
  const router = useRouter();

  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const messagesEndRef = useRef<ScrollView>(null);
  const [opponentNickname, setOpponentNickname] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const stompClient = useRef<Client | null>(null);

  // 메시지 목록 하단으로 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollToEnd({ animated: true });
  };

  // 누구와의 채팅방인지
  useEffect(() => {
    if (!roomId || !currentUserEmail) return;
    dmApi.getMyRooms(currentUserEmail).then((rooms) => {
      const room = rooms.find((r) => r.id === Number(roomId));
      if (!room) return;
      // 내가 sender면 상대는 receiver
      const nickname =
        room.senderEmail === currentUserEmail
          ? room.receiverNickname
          : room.senderNickname;
      setOpponentNickname(nickname);
    });
  }, [roomId, currentUserEmail]);

  // 기존 메시지 불러오기
  useEffect(() => {
    if (!roomId || !currentUserEmail) return;
    dmApi.getMessages(Number(roomId), currentUserEmail).then((data) => {
      setMessages(data ?? []);
    });
  }, [roomId, currentUserEmail]);

  // 메시지 보낼 때 마다 스크롤 내리기
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    getUserEmail().then((email) => setCurrentUserEmail(email));
  }, []);

  // 메시지 전송
  const sendMessage = () => {
    if (!inputValue.trim() || !stompClient.current || !currentUserEmail) return;
    stompClient.current.publish({
      destination: "/pub/dm/message",
      body: JSON.stringify({
        roomId: Number(roomId),
        senderEmail: currentUserEmail,
        content: inputValue,
        createdAt: new Date().toISOString(),
      }),
    });
    setInputValue("");
  };

  //WebSocket 연결
  useEffect(() => {
    if (!roomId || !currentUserEmail) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://192.168.30.77:8080/api/ws"),
      onConnect: () => {
        console.log("WebSocket 연결 성공!");
        // 채팅방 구독
        console.log("WebSocket 연결 성공~");
        client.subscribe(`/sub/dm/room/${roomId}`, (message) => {
          console.log("메시지 수신 : ", message.body);
          const newMessage: ChatMessageDTO = JSON.parse(message.body);
          // prev 방식으로 최신 상태 참조
          setMessages((prev) => [...prev, newMessage]);
        });
      },
      onDisconnect: () => {
        console.log("WebSocket 연결 해제!!");
      },
    });
    client.activate();
    stompClient.current = client;
    // 컴포넌틑 언마운트 시 연결 해제
    return () => {
      client.deactivate();
    };
  }, [roomId, currentUserEmail]);

  return (
    <SafeAreaView style={{ flex: 1, padding: 10 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable onPress={() => router.push("/dm")}>
          <Text>채팅방으로 이동</Text>
        </Pressable>
        {/* 헤더 */}

        <Text>{opponentNickname} 님과의 채팅방</Text>

        {/* 메세지 목록 */}
        <ScrollView
          ref={messagesEndRef}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {messages.map((msg, index) => {
            const isMine = msg.senderEmail === currentUserEmail;
            console.log("msg.sender", msg.senderProfileImg);
            const prevMsg = messages[index - 1];
            const showTime =
              !prevMsg ||
              formatTime(prevMsg.createdAt) !== formatTime(msg.createdAt);

            return (
              <View
                key={msg.id}
                style={{ flexDirection: isMine ? "row-reverse" : "row" }}
              >
                <View>
                  {msg.senderProfileImg ? (
                    <Image
                      source={{ uri: msg.senderProfileImg }}
                      style={{ width: 32, height: 32, borderRadius: 16 }}
                    />
                  ) : (
                    <Text>{msg.senderNickname?.[0] ?? ""}</Text>
                  )}
                </View>

                <View>
                  {showTime && <Text>{formatTime(msg.createdAt)}</Text>}
                  <Text>{msg.content}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
        {/* 메시지 입력 */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Input
            style={{ width: 200 }}
            value={inputValue}
            onChangeText={(e) => setInputValue(e)}
            //onKeyPress={}
            placeholder="메시지를 입력하세요."
          />

          <Pressable onPress={sendMessage}>
            <Ionicons name="send" size={24} color={"black"} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
