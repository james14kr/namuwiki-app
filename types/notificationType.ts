// 백엔드에서 내려오는 알림 타입
export type NotificationType = "FOLLOW" | "COMMENT" | "DM" | "SENSOR";

// 백엔드 SSE 알림 DTO
export interface NotificationDTO {
  id: string;
  type: NotificationType;
  message: string;
  senderNickname?: string;
  createdAt: string;
  isRead: boolean;
}
