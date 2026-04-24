import { ChatMessageDTO } from "@/types/dmType"
import { useEffect, useRef, useState } from "react"
import { Client, Frame, IMessage} from "@stomp/stompjs";

// 환경변수에서 서버 주소 가져오기
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// roomId: 입장한 채팅방 번호, senderEmail: 현재 로그인한 유저 이메일
export const useChat = (roomId: number, senderEmail : string) => {

  // 화면에 표시 할 메시지 목록 상태값을 저장한 state 변수
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);

  // STOMP 클라이언트 인스턴스를 저장 (리렌더링 해도 값을 유지)
  // useState 대신 useRef 쓰는 이유 : 값이 바뀌어도 화면을 다시 그릴 필요가 X
  const stompClient = useRef<Client | null>(null);

  useEffect(() => {
    // roomId나 senderEmail이 없으면 연결하지 않음
    if(!roomId || !senderEmail) return;

    // STOMP 클라이언트 생성
    const client = new Client({

      // WebSocket 연결 생성 함수
      webSocketFactory: () => new WebSocket(`ws://${BASE_URL?.replace("http://","")}/api/ws/websocket`),

      // 연결 성공했을 때 실행
      onConnect: () => {
        console.log("WebSocket 연결 성공!");

        // 이 채팅방의 메시지를 구독(수신 대기)
        // 누군가 이 방에 메시지를 보내면 자동으로 실행됨
        client.subscribe(`/sub/dm/room/${roomId}`, (message: IMessage) => {
          console.log(message)
          // 서버에서 받은 JSON 문자열을 객체로 변환
          const newMessage: ChatMessageDTO = JSON.parse(message.body);

          // 기존 메시지 배열 뒤에 새 메시지 추가
          setMessages((prev) => [...prev, newMessage]);
        });
      },

      // 연결이 끊어졌을 때 실행
      onDisconnect: () => {
        console.log("WebSocket 연결 해제");
      },

      //STOMP 에러 발생 시 실행
      onStompError: (frame : Frame) => {
        console.log("STOMP 에러", frame);
      },
    });

    // 실제 WebSocket 연결 시작
    client.activate();

    // 클라이언트 인스턴스를 ref에 저장 (sendMessage에서 사용하기 위해서)
    stompClient.current = client;

    // 화면 나갈 때 연결 해제
    return () => {
      client.deactivate();
    };
  }, [roomId, senderEmail]);

  // 메시지 전송
  const sendMessage = (content : string) => {
    // 연결이 안 됐거나 공백만 입력한 경우 전송 안함
    if (!stompClient.current?.connected || !content.trim()) return;

    // 서버의 /pub/dm/message로 메시지 전송
    stompClient.current.publish({
      destination: "/pub/dm/message",

      // 객체를 JSON 문자열로 변환해서 전송
      body: JSON.stringify({
        roomId,
        senderEmail,
        content,
        createdAt : new Date().toISOString(),
      })
    })
  }
  // 훅을 사용하는 컴포넌트에서 꺼내 쓸 수 있도록 반환
  return {messages, setMessages, sendMessage}
}