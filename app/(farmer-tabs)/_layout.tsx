import { StyleSheet, Text, useColorScheme, View } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router';
import { Colors } from '@/constants/theme';
import { HapticTab } from '@/components/haptic-tab';
import { AntDesign, Entypo, Ionicons } from '@expo/vector-icons';

const TabLayout = () => {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: '#8A9E8A',
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Entypo name="home" size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="farm"
        options={{
          title: '내 농장',
          tabBarIcon: ({ color }) => <AntDesign name="unordered-list" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="device"
        options={{
          title: '기기등록',
          tabBarIcon: ({ color }) => <Ionicons name="leaf-sharp" size={24} color={color}/>,
        }}
      />
      <Tabs.Screen
        name="dm"
        options={{
          title: '채팅',
          tabBarIcon: ({ color }) => <Entypo name="chat" size={24} color={color}/>
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
  );
}

export default TabLayout

const styles = StyleSheet.create({})