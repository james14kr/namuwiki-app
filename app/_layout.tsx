import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message'

export const unstable_settings = {
  //앱을 처음 켰을 때 (auth) 즉 로그인 화면부터 시작하도록 설정
  initialRouteName: 'index',
};

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{headerShown: false}}/>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(farmer-tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(user-tabs)" options={{ headerShown: false }} />
          <Stack.Screen name='farm/[farmId]' options={{headerShown: false}}/>
          <Stack.Screen name='post' options={{headerShown: false}}/>
          <Stack.Screen name='dm/[roomId]' options={{headerShown: false}}/>

          <Stack.Screen name='farm/register' options={{headerShown: false}}/>
          
        </Stack>
        <StatusBar style="auto" />
        <Toast />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
