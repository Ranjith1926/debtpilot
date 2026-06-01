import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
  static async setSecure(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  }

  static async getSecure(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  }

  static async deleteSecure(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }

  static async clearSecure(): Promise<void> {
    const keys = ['dp_access_token', 'dp_refresh_token', 'dp_pin'];
    await Promise.all(keys.map((k) => SecureStore.deleteItemAsync(k).catch(() => {})));
  }

  static async set(key: string, value: unknown): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }

  static async get<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  }

  static async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  static async clearAll(): Promise<void> {
    await AsyncStorage.clear();
  }
}
