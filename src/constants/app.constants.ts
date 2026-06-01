import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const SCREEN = { WIDTH: SCREEN_WIDTH, HEIGHT: SCREEN_HEIGHT };

export const APP_CONFIG = {
  NAME: 'DebtPilot',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@debtpilot.app',
  SUPPORT_PHONE: '+91-9876543210',
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'dp_access_token',
  REFRESH_TOKEN: 'dp_refresh_token',
  USER_DATA: 'dp_user_data',
  THEME: 'dp_theme',
  LANGUAGE: 'dp_language',
  ONBOARDING_DONE: 'dp_onboarding_done',
  BIOMETRIC_ENABLED: 'dp_biometric',
  PIN: 'dp_pin',
} as const;

export const QUERY_KEYS = {
  USER: ['user'],
  LOANS: ['loans'],
  LOAN_DETAIL: (id: string) => ['loans', id],
  EMIS: ['emis'],
  EMI_CALENDAR: ['emi-calendar'],
  ANALYTICS: ['analytics'],
  INSIGHTS: ['insights'],
  REMINDERS: ['reminders'],
  NOTIFICATIONS: ['notifications'],
  PAYMENTS: ['payments'],
  HEALTH: ['health'],
  RECOMMENDATIONS: ['recommendations'],
} as const;

export const LOAN_TYPE_LABELS: Record<string, string> = {
  home: 'Home Loan',
  car: 'Car Loan',
  personal: 'Personal Loan',
  education: 'Education Loan',
  business: 'Business Loan',
  gold: 'Gold Loan',
  credit_card: 'Credit Card',
};

export const LOAN_TYPE_ICONS: Record<string, string> = {
  home: 'home',
  car: 'car',
  personal: 'person',
  education: 'school',
  business: 'business',
  gold: 'diamond',
  credit_card: 'card',
};

export const HEALTH_SCORE_LABELS = {
  excellent: { label: 'Excellent', min: 80 },
  good: { label: 'Good', min: 60 },
  average: { label: 'Average', min: 40 },
  poor: { label: 'Needs Work', min: 0 },
} as const;

export const CURRENCY = {
  SYMBOL: '₹',
  CODE: 'INR',
  LOCALE: 'en-IN',
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
} as const;
