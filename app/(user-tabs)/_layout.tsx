import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { Colors } from '@/constants/theme'
import { HapticTab } from '@/components/haptic-tab'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { useColorScheme } from '@/hooks/use-color-scheme';

const UserTabLayout = () => {

  const colorScheme = useColorScheme()

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      headerShown: false,
      tabBarButton: HapticTab
    }}>
      <Tabs.Screen name="index" options={{ title: '홈', tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} /> }} />
      <Tabs.Screen name="farm" options={{ title: '농장목록', tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} /> }} />
      <Tabs.Screen name="dm" options={{ title: '채팅', tabBarIcon: ({ color }) => <IconSymbol size={28} name="message.fill" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: '프로필', tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} /> }} />
    </Tabs>
  )
}

export default UserTabLayout

const styles = StyleSheet.create({})