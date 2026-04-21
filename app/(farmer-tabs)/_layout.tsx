import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/components/haptic-tab';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <AntDesign name="home" size={24} color="black" />,
        }}
      />
      <Tabs.Screen
        name="farm"
        options={{
          title: '내 농장',
          tabBarIcon: ({ color }) => <AntDesign name="unordered-list" size={24} color="black" />,
        }}
      />
      <Tabs.Screen
        name="plant"
        options={{
          title: '식물식별',
          tabBarIcon: ({ color }) => <Ionicons name="leaf-sharp" size={24} color="black" />,
        }}
      />
      <Tabs.Screen
        name="dm"
        options={{
          title: '채팅',
          tabBarIcon: ({ color }) => <AntDesign name="wechat" size={24} color="black" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '프로필',
          tabBarIcon: ({ color }) => <Ionicons name="person-circle-outline" size={24} color="black" />,
        }}
      />
      
    </Tabs>
  );
}
