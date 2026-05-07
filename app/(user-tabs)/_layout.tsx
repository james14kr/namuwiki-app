import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { Colors } from '@/constants/theme'
import { HapticTab } from '@/components/haptic-tab'
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import { useColorScheme } from '@/hooks/use-color-scheme';

const UserTabLayout = () => {

  const colorScheme = useColorScheme()

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      headerShown: false,
      tabBarButton: HapticTab,
      tabBarStyle: {
        paddingTop: 0
      }
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: '홈', 
          tabBarIcon: ({ color }) =>  <Entypo name="home" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="farm" 
        options={{ 
          title: '농장목록', 
          tabBarIcon: ({ color }) =><AntDesign name="unordered-list" size={24} color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="dm" 
        options={{ 
          title: '채팅', 
          tabBarIcon: ({ color }) => <Entypo name="chat" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: '프로필', 
          tabBarIcon: ({ color }) => <Ionicons name="person-circle-outline" size={24} color={color} />,
        }} 
      />
    </Tabs>
  )
}

export default UserTabLayout

const styles = StyleSheet.create({})