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

const PAGE_SIZE = 5
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

const WeatherBanner = ({weather}: {weather: {temp: number
  tempMin: number
  tempMax: number
  feelsLike: number
  humidity: number
  windSpeed: number
  clouds: number
  desc: string
  main: string
  cityName: string} | null}) => {
  // 날짜 포맷: "4월 30일 오후 2:30"
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const hours = now.getHours()
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? '오후' : '오전'
  const displayHour = hours > 12 ? hours - 12 : hours
  const dateStr = `${month}월 ${day}일 ${ampm} ${displayHour}:${minutes}`

  return (
    <ImageBackground
      source={weather ? getWeatherImage(weather.main) : require('@/assets/images/clear.jpeg')}
      style={styles.weatherCard}
      imageStyle={{ borderRadius: 16 }}
    >
      <View style={styles.weatherOverlay}>

        {/* 상단: 도시명 + 최저/최고 */}
        <View style={styles.weatherTop}>
          <View>
            <Text style={styles.weatherCity}>{weather?.cityName ?? '위치 불러오는 중'}</Text>
            <Text style={styles.weatherDate}>{dateStr}</Text>
          </View>
          {weather && (
            <Text style={styles.weatherMinMax}>
              L:{weather.tempMin}° H:{weather.tempMax}°
            </Text>
          )}
        </View>

        {/* 중간: 아이콘 + 기온 + 날씨 설명 */}
        {weather ? (
          <View style={styles.weatherMiddle}>
            <MaterialCommunityIcons
              name={getWeatherIcon(weather.main) as any}
              size={52}
              color="#fff"
            />
            <Text style={styles.weatherTemp}>{weather.temp}°</Text>
            <Text style={styles.weatherDesc}>{weather.desc}</Text>
          </View>
        ) : (
          <Text style={styles.weatherLoading}>날씨 정보를 불러오는 중...</Text>
        )}

        {/* 하단: 4개 칩 */}
        {weather && (
          <View style={styles.weatherChips}>
            <View style={styles.chip}>
              <MaterialCommunityIcons name="water-percent" size={14} color="#fff" />
              <Text style={styles.chipText}>{weather.humidity}%</Text>
            </View>
            <View style={styles.chip}>
              <MaterialCommunityIcons name="weather-windy" size={14} color="#fff" />
              <Text style={styles.chipText}>{weather.windSpeed}m/s</Text>
            </View>
            <View style={styles.chip}>
              <MaterialCommunityIcons name="thermometer" size={14} color="#fff" />
              <Text style={styles.chipText}>체감 {weather.feelsLike}°</Text>
            </View>
            <View style={styles.chip}>
              <MaterialCommunityIcons name="weather-rainy" size={14} color="#fff" />
              <Text style={styles.chipText}>구름 {weather.clouds}%</Text>
            </View>
          </View>
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
    tempMin: number
    tempMax: number
    feelsLike: number
    humidity: number
    windSpeed: number
    clouds: number
    desc: string
    main: string
    cityName: string
  } | null>(null)

  // 구독 중인 농장 목록
  const [followList, setFollowList] = useState<FollowItem[]>([])

  // 현재 선택된 농장 이메일 (null이면 전체 게시글 표시)
  const [selectedFarmer, setSelectedFarmer] = useState<string | null>(null)

  // 현재 보여줄 게시글 수
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)


  // ── 구독 농장 목록 로드 ──
  // 로그인한 유저의 이메일로 팔로우 목록 조회
  // 앱 최초 실행 시 한 번만 실행 (빈 의존성 배열)
  useEffect(() => {
    const loadFollowList = async () => {
      try {
        const email = await getCurrentUserEmail()
        if (!email) return
        const data = await getFollowList(email)
        console.log(`팔로우 목록 : `, JSON.stringify(data))
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
  // 해당 수만큼 잘라서 보여주기 (무한스크롤)
  const filteredPosts = (selectedFarmer
    ? posts.filter((p) => p.memEmail === selectedFarmer)
    : posts
  ).slice(0, displayCount)  // 

  // 해당 수만큼 피드 불러오기
  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + PAGE_SIZE)
  }

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
          tempMin: Math.round(data.main.temp_min),
          tempMax: Math.round(data.main.temp_max),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          clouds: data.clouds.all,
          desc: data.weather[0].description,
          main: data.weather[0].main,
          cityName: data.name
        })
      } catch (e: any) {
        console.log('에러 발생:', e?.message)
      }
    }
    loadWeather()
  }, [])

  return (
    <SafeAreaView style={styles.container}>

      {/* 헤더 */}
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

      {/* 구독 농장 바 - 스크롤해도 상단 고정 */}
      <FarmerBar
        followList={followList}
        selectedFarmer={selectedFarmer}
        onSelect={(email) => {
          setSelectedFarmer(email)
          setDisplayCount(PAGE_SIZE)  // 농장 바꾸면 5개로 초기화
        }}
      />

      {/* 게시글 목록 + 날씨 배너 */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={<WeatherBanner weather={weather} />}
        contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 12 }}
        renderItem={({ item }) => <PostFeedCard post={item} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
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
    backgroundColor: '#6A9469',
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
    borderRadius: 16,
    overflow: 'hidden',
    height: 180,
  },
  weatherOverlay: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16,
    justifyContent: 'space-between',
  },
  weatherTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  weatherCity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  weatherDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  weatherMinMax: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  weatherMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weatherTemp: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  weatherDesc: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  weatherChips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  chipText: {
    fontSize: 12,
    color: '#fff',
  },
  weatherLoading: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  
})