

// 채팅방 타입
export interface ChatRoomDTO{
  id : number;
  senderEmail : string;
  receiverEmail: string;
  senderNickname: string;
  receiverNickname: string;
  senderProfileImg: string;
  receiverProfileImg: string;
  lastMessage: string;
  createdAt: string;
  unreadCount: number;

}


// 메시지 타입
export interface ChatMessageDTO {
  id: number;
  roomId: number;
  senderEmail: string;
  senderNickname: string;
  senderProfileImg: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

// 채팅방 생성 요청 타입
export interface ChatRoomRequest {
  senderEmail: string;
  receiverEmail: string;
}