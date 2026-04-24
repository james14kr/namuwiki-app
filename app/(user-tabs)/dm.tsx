import { dmApi } from "@/api/dm.api";
import { ChatRoomDTO } from "@/types/dmType";
import { getUserEmail } from "@/utils";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

////////////// 채팅방 목록 화면 //////////////
const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  date.setHours(date.getHours() + 9);
  return date.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const DmHome = () => {
  const router = useRouter();
  const [currentUserEmail, setCurrentUserEamil] = useState<string | null>(null);

  const [rooms, setRooms] = useState<ChatRoomDTO[]>([]);

  useEffect(() => {
    getUserEmail().then((email) => {
      console.log("email:", email)
      setCurrentUserEamil(email);
      if (!email) return;
      dmApi.getMyRooms(email).then((data) => {
        setRooms(data);
        console.log("rooms data: ", data);
      });
    });
  }, []);

  // 상대방 정보 가져오는 기능(sender <-> receiver)
  const getOpponent = (room: ChatRoomDTO) => {
    if (room.senderEmail === currentUserEmail) {
      return {
        email: room.receiverEmail,
        nickname: room.receiverNickname,
        profileImg: room.receiverProfileImg,
      };
    }
    return {
      email: room.senderEmail,
      nickname: room.senderNickname,
      profileImg: room.senderProfileImg,
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text>DM 목록</Text>
      {rooms.length === 0 ? (
        <Text>대화 내역이 없습니다.</Text>
      ) : (
        rooms.map((room) => {
          const opponent = getOpponent(room);
          return (
            <Pressable key={room.id} onPress={() => router.push(`/dm/${room.id}`)}>
              <View>
                <View>
                  {opponent.profileImg ? (
                    <Image
                      source={{ uri: opponent.profileImg }}
                      defaultSource={require("@/assets/images/default-profile.png")}
                    />
                  ) : (
                    <Text>{opponent.nickname?.[0] ?? "U"}</Text>
                  )}
                </View>
                <View>
                  <Text>{opponent.nickname}</Text>
                  <Text>{formatDate(room.createdAt)}</Text>
                </View>
                <View>
                  <Text>{room.lastMessage ?? "대화를 시작해보세요."}</Text>
                  {room.unreadCount > 0 && (
                    <Text>
                      {room.unreadCount}개의 읽지 않은 메세지가 있습니다.
                    </Text>
                  )}
                </View>
              </View>
            </Pressable>
          );
        })
      )}
    </SafeAreaView>
  );
};

export default DmHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
