import * as SecureStore from 'expo-secure-store';
import {jwtDecode} from 'jwt-decode';

interface CustomJwtPayload {
  sub?: string;
  role?: string;
  memNickname: string;
}

export const decodeToken = (token: string): CustomJwtPayload | null => {
  try {
    return jwtDecode<CustomJwtPayload>(token)
  } catch {
    return null;
  }
};

export const getUserRole = async (): Promise<string | null> => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (!token) return null;
  const decoded = decodeToken(token.replace("Bearer ", ""));
  return decoded?.role ?? null;
};

export const isAdmin = async (): Promise<boolean> => {
  return (await getUserRole()) === "ADMIN";
};

export const getUserEmail = async (): Promise<string | null> => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (!token) return null;
  const decoded = decodeToken(token.replace("Bearer ", ""));
  return decoded?.sub ?? null;
};

export const getUserNickName = async (): Promise<string | null> => {
  const token = await SecureStore.getItemAsync("accessToken")
  if(!token) return null;
  const decoded = decodeToken(token.replace("Bearer ", ""));
  return decoded?.memNickname ?? null;
}