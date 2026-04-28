import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { postApi } from '@/api/post.api'
import type { PostResponse } from '@/types/postType'
import PostFeedCard from '@/components/PostFeedCard'
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import FarmerBar from '@/components/farmer-bar'
import { getFollowList } from '@/api/follow.api'
import { getCurrentUserEmail } from '@/utils/auth1'
import * as Location from 'expo-location'
import { getWeather } from '@/api/weather.api'
import { Ionicons } from '@expo/vector-icons'

// 팔로우 타입 - follow.api 응답 구조에 맞게 정의
interface FollowItem {
  farmerEmail: string
  farmerNickname: string
  farmerProfileImg: string | null
}

const getWeatherImage = (main: string) => {
  switch(main) {
    case 'Clear':
      return require('@/assets/images/clear.jpeg')
    case 'Clouds':
    case 'Mist':
    case 'Fog':
    case 'Haze':
      return require('@/assets/images/clouds.jpeg')
    case 'Rain':
    case 'Drizzle':
    case 'Thunderstorm':
      return require('@/assets/images/rain.jpeg')
    case 'Snow':
      return require('@/assets/images/snow.jpeg')
    default:
      return require('@/assets/images/clear.jpeg')
  }
}

const getWeatherIcon = (main: string) => {
  switch(main) {
    case 'Clear':
      return 'weather-sunny'
    case 'Clouds':
    case 'Mist':
    case 'Fog':
    case 'Haze':
      return 'weather-cloudy'
    case 'Rain':
    case 'Drizzle':
    case 'Thunderstorm':
      return 'weather-rainy'
    case 'Snow':
      return 'weather-snowy'
    default:
      return 'weather-sunny'
  }
}

const WeatherBanner = ({weather}: {weather: {temp: number; humidity: number; desc: string; main: string} | null}) => {
  return(
    <ImageBackground
      source={weather ? getWeatherImage(weather.main) : require('@/assets/images/clear.jpeg')}
      style={styles.weatherCard}
      imageStyle={{borderRadius: 12}}
    >
      <View style={styles.weatherOverlay}>
        <Text style={styles.weatherLabel}>오늘의 날씨</Text>
        {weather ? (
          <View style={styles.weatherRow}>
            <View>
              <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
              <Text style={styles.weatherHumidity}>{weather.humidity}%</Text>
            </View>
            <View style={styles.weatherIconGroup}>
              <MaterialCommunityIcons
                name={getWeatherIcon(weather.main) as any}
                size={44}
                color='#fff'
              />
              <Text style={styles.weatherDesc}>{weather.desc}</Text>
            </View>
           
          </View>
        ):(
          <Text style={styles.weatherLoading}>날씨 정보를 불러오는 중...</Text>
        )}
      </View>
    </ImageBackground>
  )
}

const Home = () => {
  const router = useRouter()

  // 전체 게시글 목록
  const [posts, setPosts] = useState<PostResponse[]>([])
  const [weather, setWeather] = useState <{
    temp: number
    humidity: number
    desc: string
    main: string
  } | null>(null)

  // 구독 중인 농장 목록
  const [followList, setFollowList] = useState<FollowItem[]>([])

  // 현재 선택된 농장 이메일 (null이면 전체 게시글 표시)
  const [selectedFarmer, setSelectedFarmer] = useState<string | null>(null)

  // ── 구독 농장 목록 로드 ──
  // 로그인한 유저의 이메일로 팔로우 목록 조회
  // 앱 최초 실행 시 한 번만 실행 (빈 의존성 배열)
  useEffect(() => {
    const loadFollowList = async () => {
      try {
        const email = await getCurrentUserEmail()
        if (!email) return
        const data = await getFollowList(email)
        setFollowList(data)
      } catch (e) {
        console.error('팔로우 목록 오류', e)
      }
    }
    loadFollowList()
  }, [])

  // ── 게시글 목록 로드 ──
  // useFocusEffect: 화면에 포커스가 올 때마다 실행
  // 게시글 등록/수정 후 돌아왔을 때도 최신 목록 반영됨
  useFocusEffect(
    useCallback(() => {
      const loadPosts = async () => {
        const data = await postApi.getAll()
        setPosts(data)
      }
      loadPosts()
    }, [])
  )

  // ── 게시글 필터링 ──
  // selectedFarmer가 null이면 전체, 아니면 해당 농장주 게시글만
  const filteredPosts = selectedFarmer
    ? posts.filter((p) => p.memEmail === selectedFarmer)
    : posts
  useEffect(() => {
    
    const loadWeather = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') return

        // getLastKnownPositionAsync 먼저 시도
        let coords = await Location.getLastKnownPositionAsync()

        // 그것도 없으면 기본 좌표(서울) 사용
        const lat = coords?.coords.latitude ?? 37.5665
        const lon = coords?.coords.longitude ?? 126.9780

        const data = await getWeather(lat, lon)
        setWeather({
          temp: Math.round(data.main.temp),
          humidity: data.main.humidity,
          desc: data.weather[0].description,
          main: data.weather[0].main
        })
      } catch (e: any) {
        console.log('에러 발생:', e?.message)
      }
    }
    loadWeather()
  }, [])

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.logo}>🌿 NamuWiki Farm</Text>
        <View style={styles.headerIcons}>
          <Pressable>
          <Ionicons name="search-outline" size={24} color="#2C4A2C" />
          </Pressable>
          <Pressable>
            <Ionicons name="notifications-outline" size={24} color="#2C4A2C" />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={filteredPosts}
        ListHeaderComponent={
          <>
            <WeatherBanner weather={weather} />
            <FarmerBar
              followList={followList}
              selectedFarmer={selectedFarmer}
              onSelect={setSelectedFarmer}
            />
          </>
        }
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PostFeedCard post={item} />}
      />

      {/* 게시글 등록 버튼 - 우하단 고정 */}
      <Pressable
        style={({ pressed }) => [styles.regBtn, pressed && styles.pressed]}
        onPress={() => router.push('/post/postRegister')}
      >
        <AntDesign name="plus" size={24} color="white" />
      </Pressable>

    </SafeAreaView>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  // 우하단 고정 등록 버튼
  regBtn: {
    position: 'absolute',
    width: 50,
    height: 50,
    bottom: 30,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 버튼 눌렸을 때 투명도
  pressed: {
    opacity: 0.8,
  },
  header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 12,
  backgroundColor: '#fff',
  borderBottomWidth: 1,
  borderBottomColor: '#f0f0f0',
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C4A2C',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  weatherCard: {
    margin: 16,
    padding: 12,
    overflow: 'hidden',
    borderRadius: 12,
  },
  weatherOverlay: {
    flex: 1,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',   // 반투명 오버레이
    borderRadius: 12,
  },
  weatherLabel: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 8,
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherTemp: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  weatherHumidity: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
  },
  weatherDesc: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  weatherLoading: {
    fontSize: 13,
    color: '#6A9469',
  },
  weatherIconGroup: {
  alignItems: 'center',
  gap: 4,
},
})