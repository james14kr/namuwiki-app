import { dmApi } from '@/api/dm.api';
import { ChatRoomDTO } from '@/types/dmType';
import { getUserEmail } from '@/utils';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native'

export default function DmRoom() {
  return (
    <View>
      <Text>채팅방</Text>
    </View>
  )
}