import * as SecureStore from 'expo-secure-store'
import { jwtDecode } from 'jwt-decode'

interface CustomJwtPayload {
  exp: number
  iat: number
  memNickname: string
  role: string
  sub: string  // 이메일
}

// SecureStore에서 토큰 꺼내서 이메일 반환
export const getCurrentUserEmail = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync('accessToken')
    if (!token) return null
    const payload = jwtDecode<CustomJwtPayload>(token.split(' ')[1] ?? token)
    return payload.sub  // sub가 이메일
  } catch {
    return null
  }
}

// 토큰에서 role 반환
export const getCurrentUserRole = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync('accessToken')
    if (!token) return null
    const payload = jwtDecode<CustomJwtPayload>(token.split(' ')[1] ?? token)
    return payload.role
  } catch {
    return null
  }
}