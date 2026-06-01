import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { apiClient } from '@api/axios.client';
import { ENDPOINTS } from '@constants/endpoints';

// expo-notifications FCM is not supported in Expo Go since SDK 53
const isExpoGo = Constants.appOwnership === 'expo';

export const FCMService = {
  async registerDeviceToken(): Promise<string | null> {
    if (Platform.OS === 'web' || isExpoGo) return null;

    // Dynamic import prevents the auto-registration side-effect from running at module load
    const Notifications = await import('expo-notifications');

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('debtpilot_alerts', {
        name: 'DebtPilot Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#7C3AED',
        sound: 'default',
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    const { data: token } = await Notifications.getDevicePushTokenAsync();

    try {
      await apiClient.post(ENDPOINTS.USER.DEVICE_TOKEN, {
        token,
        platform: Platform.OS,
      });
    } catch {
      // Non-fatal: token will be registered on next login if this fails
    }

    return token;
  },

  async deregisterDeviceToken(): Promise<void> {
    if (isExpoGo) return;
    try {
      const Notifications = await import('expo-notifications');
      const { data: token } = await Notifications.getDevicePushTokenAsync();
      await apiClient.delete(ENDPOINTS.USER.DEVICE_TOKEN, { data: { token } });
    } catch {
      // Best-effort on logout
    }
  },
};
