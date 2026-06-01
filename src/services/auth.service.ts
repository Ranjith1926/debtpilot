import { MockAPI } from '@api/mock.client';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '@constants/app.constants';
import { LoginPayload, RegisterPayload, OTPPayload } from '@/types/user.types';

export class AuthService {
  static async login(payload: LoginPayload) {
    const response = await MockAPI.auth.login(payload.phone, payload.password);
    const { user, accessToken, refreshToken } = response.data;
    await Promise.all([
      StorageService.setSecure(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
      StorageService.setSecure(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
      StorageService.set(STORAGE_KEYS.USER_DATA, user),
    ]);
    return response.data;
  }

  static async register(payload: RegisterPayload) {
    return MockAPI.auth.register();
  }

  static async verifyOTP(payload: OTPPayload) {
    const response = await MockAPI.auth.verifyOTP();
    const { user, accessToken, refreshToken } = response.data;
    await Promise.all([
      StorageService.setSecure(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
      StorageService.setSecure(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
      StorageService.set(STORAGE_KEYS.USER_DATA, user),
    ]);
    return response.data;
  }

  static async logout() {
    await StorageService.clearSecure();
    await StorageService.remove(STORAGE_KEYS.USER_DATA);
  }

  static async getStoredUser() {
    return StorageService.get(STORAGE_KEYS.USER_DATA);
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = await StorageService.getSecure(STORAGE_KEYS.ACCESS_TOKEN);
    return !!token;
  }
}
