import { dmApi } from "@/api/dm.api";
import { ChatRoomDTO } from "@/types/dmType";
import { getUserEmail } from "@/utils";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  date.setHours(date.getHours() + 9);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 86400000) {
    return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
};

const DmHome = () => {
  const router = useRouter();
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [rooms, setRooms] = useState<ChatRoomDTO[]>([]);

  const waveAnim = useRef(new Animated.Value(0)).current;
  const waveDrift1 = useRef(
    waveAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 18] })
  ).current;
  const waveDrift2 = useRef(
    waveAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] })
  ).current;
  const waveDrift3 = useRef(
    waveAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] })
  ).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 4500, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 4500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [waveAnim]);

  useEffect(() => {
    getUserEmail().then((email) => {
      setCurrentUserEmail(email);
      if (!email) return;
      dmApi.getMyRooms(email).then((data) => setRooms(data));
    });
  }, []);

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

  const renderRoom = ({ item: room }: { item: ChatRoomDTO }) => {
    const opponent = getOpponent(room);
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => router.push(`/dm/${room.id}`)}
      >
        <View style={styles.avatarWrap}>
          {opponent.profileImg ? (
            <Image
              source={{ uri: opponent.profileImg }}
              defaultSource={require("@/assets/images/default-profile.png")}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>
                {opponent.nickname?.[0]?.toUpperCase() ?? "U"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardTop}>
            <Text style={styles.nickname} numberOfLines={1}>
              {opponent.nickname}
            </Text>
            <Text style={styles.time}>{formatDate(room.createdAt)}</Text>
          </View>
          <View style={styles.cardBottom}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {room.lastMessage ?? "대화를 시작해보세요."}
            </Text>
            {room.unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {room.unreadCount > 99 ? "99+" : room.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Animated.View style={[styles.blob1, { transform: [{ translateX: waveDrift1 }] }]} />
        <Animated.View style={[styles.blob2, { transform: [{ translateX: waveDrift2 }] }]} />
        <Animated.View style={[styles.blob3, { transform: [{ translateX: waveDrift3 }] }]} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>메시지</Text>
          <Text style={styles.headerSubtitle}>
            {rooms.length > 0 ? `${rooms.length}개의 대화` : "새로운 대화를 시작해보세요"}
          </Text>
        </View>
      </View>

      {/* 채팅방 목록 */}
      {rooms.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>아직 대화가 없어요</Text>
          <Text style={styles.emptySubtitle}>농부들과 대화를 시작해보세요</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRoom}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
};

export default DmHome;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: 130,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    position: "relative",
    justifyContent: "flex-end",
    paddingBottom: 18,
    paddingHorizontal: 24,
  },
  blob1: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#CCDECB",
    top: -140,
    right: -60,
    opacity: 0.70,
  },
  blob2: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#BDD5BC",
    top: -80,
    right: 40,
    opacity: 0.45,
  },
  blob3: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#E2F0E2",
    bottom: -50,
    left: -20,
    opacity: 0.60,
  },
  headerContent: {
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A2E1A",
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#8A9E8A",
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  separator: {
    height: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#2C3E2C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#EDF5ED",
  },
  cardPressed: {
    backgroundColor: "#F4FAF4",
  },
  avatarWrap: {
    marginRight: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#6A9469",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cardContent: {
    flex: 1,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  nickname: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A2E1A",
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 11,
    color: "#8A9E8A",
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastMessage: {
    fontSize: 13,
    color: "#8A9E8A",
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: "#6A9469",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 60,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A2E1A",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#8A9E8A",
  },
});
