import { useEffect, useRef, useState } from "react";
import { NotificationDTO, NotificationType } from "@/types/notificationType";
import Toast from "react-native-toast-message";
import { Client, Frame, IMessage } from "@stomp/stompjs";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// 알림 타입별 Toast 제목
const NOTIFICATION_TITLE: Record<NotificationType, string> = {
  FOLLOW: "새 팔로워",
  COMMENT: "새 댓글",
  DM: "새 메시지",
  SENSOR: "농장 알림",
};

export const useNotification = (userId: string | null) => {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const stompClient = useRef<Client | null>(null);

  useEffect(() => {
    // userId가 없으면 연결하지 않음
    if (!userId) return;

    const client = new Client({
      // DM(useChat.ts)과 동일한 WebSocket 엔드포인트 사용
      webSocketFactory: () =>
        new WebSocket(
          `ws://${BASE_URL?.replace("http://", "").replace("https://", "")}/api/ws/websocket`
        ),

      onConnect: () => {
        console.log("알림 WebSocket 연결 성공");

        // /sub/notifications/{userId} 토픽 구독
        client.subscribe(
          `/sub/notifications/${userId}`,
          (message: IMessage) => {
            try {
              const data: NotificationDTO = JSON.parse(message.body);

              setNotifications((prev) => [data, ...prev]);
              setUnreadCount((prev) => prev + 1);

              Toast.show({
                type: "info",
                text1: NOTIFICATION_TITLE[data.type] ?? "알림",
                text2: data.message,
                position: "top",
                visibilityTime: 4000,
              });
            } catch (e) {
              console.error("알림 파싱 오류", e);
            }
          }
        );
      },

      onDisconnect: () => {
        console.log("알림 WebSocket 연결 해제");
      },

      onStompError: (frame: Frame) => {
        console.error("알림 STOMP 오류", frame);
      },
    });

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
      stompClient.current = null;
    };
  }, [userId]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markAllAsRead };
};
