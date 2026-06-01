export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  creditScore: number;
  financialHealthScore: number;
  monthlyIncome: number;
  joinedAt: string;
  kycVerified: boolean;
  biometricEnabled: boolean;
  notificationsEnabled: boolean;
  preferredLanguage: 'en' | 'ta' | 'hi';
  preferredCurrency: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface OTPPayload {
  phone: string;
  otp: string;
}

export interface BiometricResult {
  success: boolean;
  error?: string;
}
