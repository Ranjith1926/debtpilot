export const CACHE_TTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 3600,
  DAY: 86400,
} as const;

export const CACHE_KEYS = {
  USER: (id: string) => `user:${id}`,
  USER_LOANS: (userId: string) => `user:${userId}:loans`,
  LOAN: (id: string) => `loan:${id}`,
  DASHBOARD: (userId: string) => `dashboard:${userId}`,
  ANALYTICS: (userId: string, month: number, year: number) => `analytics:${userId}:${year}:${month}`,
  UPCOMING_EMIS: (userId: string) => `upcoming_emis:${userId}`,
  NOTIFICATIONS: (userId: string) => `notifications:${userId}`,
  RATE_LIMIT: (ip: string) => `rate_limit:${ip}`,
  REFRESH_TOKEN: (token: string) => `refresh:${token}`,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const HEALTH_SCORE = {
  MAX: 100,
  THRESHOLDS: {
    EXCELLENT: 80,
    GOOD: 60,
    FAIR: 40,
    POOR: 0,
  },
  LABELS: {
    EXCELLENT: 'Excellent',
    GOOD: 'Good',
    FAIR: 'Fair',
    POOR: 'Poor',
  },
} as const;

export const EMI_REMINDER_DAYS = [1, 3, 7] as const;
