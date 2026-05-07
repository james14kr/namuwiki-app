import { createContext, useContext, useEffect, useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { NotificationDTO } from "@/types/notificationType";
import { getUserEmail } from "@/utils/auth";

interface NotificationContextType {
  notifications: NotificationDTO[];
  unreadCount: number;
  markAllAsRead: () => void;
  setCurrentUserId: (id: string | null) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAllAsRead: () => {},
  setCurrentUserId: () => {},
});

export const useNotificationContext = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { notifications, unreadCount, markAllAsRead } = useNotification(currentUserId);

  // 앱 실행 시 저장된 토큰으로 자동 연결
  useEffect(() => {
    const restoreUser = async () => {
      const email = await getUserEmail();
      if (email) {
        setCurrentUserId(email);
      }
    };
    restoreUser();
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAllAsRead, setCurrentUserId }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
