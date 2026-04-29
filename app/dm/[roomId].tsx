import { dmApi } from "@/api/dm.api";
import Input from "@/components/ui/Input";
import { ChatMessageDTO, ChatRoomDTO } from "@/types/dmType";
import { getUserEmail } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { Client } from "@stomp/stompjs";
import { useFocusEffect } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router/build/hooks";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
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
  const [opponentProfileImg, setOpponentProfileImg] = useState<string | null>(
    null,
  );
  const [inputValue, setInputValue] = useState<string>("");
  const stompClient = useRef<Client | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    if (!roomId || !currentUserEmail) return;
    dmApi.getMyRooms(currentUserEmail).then((rooms) => {
      const room = rooms.find((r) => r.id === Number(roomId));
      if (!room) return;
      const isMe = room.senderEmail === currentUserEmail;
      setOpponentNickname(isMe ? room.receiverNickname : room.senderNickname);
      setOpponentProfileImg(
        isMe
          ? (room.receiverProfileImg ?? null)
          : (room.senderProfileImg ?? null),
      );
    });
  }, [roomId, currentUserEmail]);

  useEffect(() => {
    if (!roomId || !currentUserEmail) return;
    dmApi.getMessages(Number(roomId), currentUserEmail).then((data) => {
      setMessages(data ?? []);
    });
  }, [roomId, currentUserEmail]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    getUserEmail().then((email) => setCurrentUserEmail(email));
  }, []);

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

  useEffect(() => {
    if (!roomId || !currentUserEmail) return;
    const client = new Client({
      webSocketFactory: () => new SockJS("http://192.168.30.77:8080/api/ws"),
      onConnect: () => {
        client.subscribe(`/sub/dm/room/${roomId}`, (message) => {
          const newMessage: ChatMessageDTO = JSON.parse(message.body);
          setMessages((prev) => [...prev, newMessage]);
        });
      },
      onDisconnect: () => {},
    });
    client.activate();
    stompClient.current = client;
    return () => {
      client.deactivate();
    };
  }, [roomId, currentUserEmail]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={24} color="#2C4A2C" />
        </Pressable>

        <View style={styles.headerCenter}>
          {opponentProfileImg ? (
            <Image
              source={{ uri: opponentProfileImg }}
              style={styles.headerAvatar}
            />
          ) : (
            <View style={styles.headerAvatarFallback}>
              <Text style={styles.headerAvatarInitial}>
                {opponentNickname?.[0]?.toUpperCase() ?? "?"}
              </Text>
            </View>
          )}
          <Text style={styles.headerName} numberOfLines={1}>
            {opponentNickname || "..."}
          </Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* 메시지 목록 */}
        <ScrollView
          ref={messagesEndRef}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, index) => {
            const isMine = msg.senderEmail === currentUserEmail;
            const prevMsg = messages[index - 1];
            const showTime =
              !prevMsg ||
              formatTime(prevMsg.createdAt) !== formatTime(msg.createdAt);
            const showAvatar =
              !isMine &&
              (index === 0 ||
                messages[index - 1].senderEmail !== msg.senderEmail);

            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  isMine ? styles.messageRowMine : styles.messageRowTheirs,
                ]}
              >
                {/* 상대방 아바타 */}
                {!isMine && (
                  <View style={styles.msgAvatarWrap}>
                    {showAvatar ? (
                      msg.senderProfileImg ? (
                        <Image
                          source={{ uri: msg.senderProfileImg }}
                          style={styles.msgAvatar}
                        />
                      ) : (
                        <View style={styles.msgAvatarFallback}>
                          <Text style={styles.msgAvatarInitial}>
                            {msg.senderNickname?.[0]?.toUpperCase() ?? "?"}
                          </Text>
                        </View>
                      )
                    ) : (
                      <View style={styles.msgAvatarPlaceholder} />
                    )}
                  </View>
                )}

                {/* 말풍선 + 시간 */}
                <View
                  style={[
                    styles.bubbleWrap,
                    isMine ? styles.bubbleWrapMine : styles.bubbleWrapTheirs,
                  ]}
                >
                  <View
                    style={[
                      styles.bubble,
                      isMine ? styles.bubbleMine : styles.bubbleTheirs,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        isMine
                          ? styles.bubbleTextMine
                          : styles.bubbleTextTheirs,
                      ]}
                    >
                      {msg.content}
                    </Text>
                  </View>
                  {showTime && (
                    <Text
                      style={[
                        styles.timeText,
                        isMine ? styles.timeTextMine : styles.timeTextTheirs,
                      ]}
                    >
                      {formatTime(msg.createdAt)}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* 입력창 */}
        <View style={styles.inputBar}>
          <Input
            containerStyle={styles.inputWrap}
            style={styles.chatInput}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="메시지를 입력하세요."
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <Pressable
            onPress={sendMessage}
            style={({ pressed }) => [
              styles.sendBtn,
              pressed && styles.sendBtnPressed,
            ]}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // 헤더
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EDF5ED",
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  headerAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6A9469",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  headerAvatarInitial: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A2E1A",
    maxWidth: 160,
  },
  headerRight: {
    width: 40,
  },

  // 메시지 목록
  messagesList: {
    flex: 1,
    backgroundColor: "#F4FAF4",
  },
  messagesContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 4,
    alignItems: "flex-end",
  },
  messageRowMine: {
    justifyContent: "flex-end",
  },
  messageRowTheirs: {
    justifyContent: "flex-start",
  },

  // 상대방 아바타
  msgAvatarWrap: {
    marginRight: 8,
    alignSelf: "flex-end",
  },
  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  msgAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#8A9E8A",
    alignItems: "center",
    justifyContent: "center",
  },
  msgAvatarInitial: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  msgAvatarPlaceholder: {
    width: 32,
  },

  // 말풍선
  bubbleWrap: {
    maxWidth: "72%",
  },
  bubbleWrapMine: {
    alignItems: "flex-end",
  },
  bubbleWrapTheirs: {
    alignItems: "flex-start",
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    backgroundColor: "#6A9469",
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E2EDE2",
    shadowColor: "#2C3E2C",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  bubbleTextMine: {
    color: "#FFFFFF",
  },
  bubbleTextTheirs: {
    color: "#1A2E1A",
  },
  timeText: {
    fontSize: 10,
    color: "#8A9E8A",
    marginTop: 4,
  },
  timeTextMine: {
    alignSelf: "flex-end",
  },
  timeTextTheirs: {
    alignSelf: "flex-start",
    marginLeft: 2,
  },

  // 입력창
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EDF5ED",
  },
  inputWrap: {
    flex: 1,
    marginRight: 8,
  },
  chatInput: {
    height: 44,
    borderRadius: 22,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#6A9469",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6A9469",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  sendBtnPressed: {
    backgroundColor: "#587A57",
    shadowOpacity: 0.15,
  },
});
