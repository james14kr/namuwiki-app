import * as SecureStore from 'expo-secure-store';

export const decodeToken = (token: string) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export const getUserRole = async (): Promise<string | null> => {
  const token = await SecureStore.getItemAsync("token");
  if (!token) return null;
  const decoded = decodeToken(token.replace("Bearer ", ""));
  return decoded?.role ?? null;
};

export const isAdmin = async (): Promise<boolean> => {
  return (await getUserRole()) === "ADMIN";
};

export const getUserEmail = async (): Promise<string | null> => {
  const token = await SecureStore.getItemAsync("token");
  if (!token) return null;
  const decoded = decodeToken(token.replace("Bearer ", ""));
  return decoded?.sub ?? null;
};