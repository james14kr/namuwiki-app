import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { postApi } from '@/api/post.api'
import type { PostResponse } from '@/types/postType'
import PostFeedCard from '@/components/PostFeedCard'
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import * as Location from 'expo-location'
import { getWeather } from '@/api/weather.api'
import { Ionicons } from '@expo/vector-icons'

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
  const router = useRouter();
  const [posts, setPosts] = useState<PostResponse[]>([]);

  const [weather, setWeather] = useState <{
    temp: number
    humidity: number
    desc: string
    main: string
  } | null>(null)


  useFocusEffect(
    useCallback(()=>{
      const loadPosts = async () => {
        const data = await postApi.getAll()
        setPosts(data)
      }
      loadPosts()
    },[])
  )

  useEffect(() => {
    // const loadWeather = async () => {
    //   try {
    //     const { status } = await Location.requestForegroundPermissionsAsync()
    //     if (status !== 'granted') return

    //     const location = await Location.getCurrentPositionAsync()
    //     const data = await getWeather(
    //       location.coords.latitude,
    //       location.coords.longitude
    //     )
    //     setWeather({
    //       temp: Math.round(data.main.temp),
    //       humidity: data.main.humidity,
    //       desc: data.weather[0].description
    //     })
    //   } catch (e) {
    //     console.log('날씨 정보를 불러올 수 없습니다', e)
    //     // 에러 시 날씨 배너는 "불러오는 중..." 상태 유지
    //   }
    // }
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
        data={posts}
        ListHeaderComponent={<WeatherBanner weather={weather}/>}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostFeedCard
            post={item}            
          />
        )}
      />

      <Pressable
      style={({pressed}) => [styles.regBtn, pressed && styles.pressed]}

        onPress={e => router.push('/post/postRegister')}
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
  registerBtn:{
    alignSelf : 'flex-start',
    margin : 12,
    backgroundColor : '#4CAF50',
    padding : 20,
    paddingVertical : 6,
    borderRadius : 50

  },
  registerText:{
    color : 'white',
    fontWeight : 'bold',
    fontSize : 30
  },
  regBtn: {
    position: 'absolute',
    width: 50,
    height: 50,
    bottom: 30,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pressed: {
    opacity: 0.8
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