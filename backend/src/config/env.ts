const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

export const env = {
  NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',

  DATABASE_URL: required('DATABASE_URL'),
  DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_URL!,

  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  JWT_SECRET: required('JWT_SECRET'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  FIREBASE_PROJECT_ID: required('FIREBASE_PROJECT_ID'),
  FIREBASE_CLIENT_EMAIL: required('FIREBASE_CLIENT_EMAIL'),
  FIREBASE_PRIVATE_KEY: required('FIREBASE_PRIVATE_KEY'),
  FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,

  ENCRYPTION_KEY: required('ENCRYPTION_KEY'),

  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),

  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  CRON_SECRET: process.env.CRON_SECRET || '',
} as const;
