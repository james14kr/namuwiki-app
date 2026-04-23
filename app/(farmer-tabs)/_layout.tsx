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
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Entypo name="home" size={24} color='#4caf50' />
        }}
      />
      <Tabs.Screen
        name="farm"
        options={{
          title: '내 농장',
          tabBarIcon: ({ color }) => <AntDesign name="unordered-list" size={24} color='#4caf50' />,
        }}
      />
      <Tabs.Screen
        name="plant"
        options={{
          title: '식물식별',
          tabBarIcon: ({ color }) => <Ionicons name="leaf-sharp" size={24} color='#4caf50'/>,
        }}
      />
      <Tabs.Screen
        name="dm"
        options={{
          title: '채팅',
          tabBarIcon: ({ color }) => <Entypo name="chat" size={24} color='#4caf50'/>
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '프로필',
          tabBarIcon: ({ color }) => <Ionicons name="person-circle-outline" size={24} color='#4caf50' />,
        }}
      />
      
    </Tabs>
  );
}

export default TabLayout

const styles = StyleSheet.create({})