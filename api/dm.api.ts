import { type ChatMessageDTO, type ChatRoomDTO, type ChatRoomRequest } from "@/types/dmType";
import { api } from "@/utils";

export const dmApi = {

  // 채팅방 생성 or 조회
  getOrCreateRoom : async(dto: ChatRoomRequest)=>{
    const {data} = await api.post<ChatRoomDTO>(`/dm/room`, dto);
    return data;
  },


  // 내 채팅방 목록 조회
  getMyRooms : async(memEmail : string)=>{
    const{data} = await api.get<ChatRoomDTO[]>(`/dm/rooms`, {params:{memEmail}});
    return data;
  },

  // 채팅방 메세지 목록 조회
  getMessages : async(roomId : number, memEmail : string)=>{
    const{data} = await api.get<ChatMessageDTO[]>(`/dm/messages/${roomId}`,{params:{memEmail}});
    return data;
  },


};