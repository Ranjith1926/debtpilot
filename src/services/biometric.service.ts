import * as LocalAuthentication from 'expo-local-authentication';
import { BiometricResult } from '@/types/user.types';

export class BiometricService {
  static async isAvailable(): Promise<boolean> {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  }

  static async getSupportedTypes() {
    return LocalAuthentication.supportedAuthenticationTypesAsync();
  }

  static async authenticate(reason = 'Authenticate to access DebtPilot'): Promise<BiometricResult> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use PIN',
      });
      return { success: result.success, error: result.success ? undefined : result.error };
    } catch (error) {
      return { success: false, error: 'Biometric authentication failed' };
    }
  }
}
