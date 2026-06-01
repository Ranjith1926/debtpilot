import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { StorageService } from '@services/storage.service';
import { STORAGE_KEYS } from '@constants/app.constants';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.debtpilot.app/v1';
const TIMEOUT = Number(process.env.EXPO_PUBLIC_API_TIMEOUT ?? 30000);

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-App-Version': '1.0.0',
    'X-Platform': 'mobile',
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await StorageService.getSecure(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await StorageService.getSecure(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken } = response.data.data;

        await StorageService.setSecure(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch {
        await StorageService.clearSecure();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
