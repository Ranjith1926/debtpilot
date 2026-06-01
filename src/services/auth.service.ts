import { apiClient } from '@api/axios.client';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '@constants/app.constants';
import { LoginPayload, RegisterPayload } from '@/types/user.types';
import { ENDPOINTS } from '@constants/endpoints';

// Backend returns { user, tokens: { accessToken, refreshToken } }
async function saveSession(data: { user: unknown; tokens: { accessToken: string; refreshToken: string } }) {
  const { user, tokens } = data;
  await Promise.all([
    StorageService.setSecure(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
    StorageService.setSecure(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
    StorageService.set(STORAGE_KEYS.USER_DATA, user),
  ]);
}

export class AuthService {
  static async login(payload: LoginPayload) {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, {
      email: payload.email,
      password: payload.password,
    });
    await saveSession(response.data.data);
    return response.data.data;
  }

  static async register(payload: RegisterPayload) {
    const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
    });
    await saveSession(response.data.data);
    return response.data.data;
  }

  static async logout() {
    try {
      const refreshToken = await StorageService.getSecure(STORAGE_KEYS.REFRESH_TOKEN);
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT, { refreshToken });
    } catch {
      // Always clear locally even if server call fails
    } finally {
      await StorageService.clearSecure();
      await StorageService.remove(STORAGE_KEYS.USER_DATA);
    }
  }

  static async getStoredUser() {
    return StorageService.get(STORAGE_KEYS.USER_DATA);
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = await StorageService.getSecure(STORAGE_KEYS.ACCESS_TOKEN);
    return !!token;
  }
}
