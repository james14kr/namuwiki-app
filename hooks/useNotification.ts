import { useEffect, useRef, useState } from "react";
import { NotificationDTO, NotificationType } from "@/types/notificationType";
import Toast from "react-native-toast-message";
import { Client, Frame, IMessage } from "@stomp/stompjs";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// ws(s)://host/api/ws/websocket 형태로 변환
// BASE_URL = "http://192.168.x.x:8080/api" → "ws://192.168.x.x:8080/api/ws/websocket"
// BASE_URL = "https://xxxx.ngrok.../api"   → "wss://xxxx.ngrok.../api/ws/websocket"
const wsProtocol = BASE_URL?.startsWith("https") ? "wss" : "ws";
const wsHost = BASE_URL?.replace(/^https?:\/\//, "").replace(/\/api$/, "");
const WS_URL = `${wsProtocol}://${wsHost}/api/ws/websocket`;

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

    console.log("알림 WS 연결 시도:", WS_URL);

    const client = new Client({
      webSocketFactory: () => new WebSocket(WS_URL),

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
