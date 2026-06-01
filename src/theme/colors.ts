export const palette = {
  // Neutrals
  black: '#000000',
  white: '#FFFFFF',
  transparent: 'transparent',

  // Brand purples
  purple50: '#F5F3FF',
  purple100: '#EDE9FE',
  purple200: '#DDD6FE',
  purple300: '#C4B5FD',
  purple400: '#A78BFA',
  purple500: '#8B5CF6',
  purple600: '#7C3AED',
  purple700: '#6D28D9',
  purple800: '#5B21B6',
  purple900: '#4C1D95',

  // Cyan
  cyan300: '#67E8F9',
  cyan400: '#22D3EE',
  cyan500: '#06B6D4',
  cyan600: '#0891B2',

  // Emerald
  emerald400: '#34D399',
  emerald500: '#10B981',
  emerald600: '#059669',

  // Amber
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  amber600: '#D97706',

  // Red
  red400: '#F87171',
  red500: '#EF4444',
  red600: '#DC2626',

  // Grays (dark theme base)
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray850: '#161B27',
  gray900: '#111827',
  gray950: '#0A0A0F',
} as const;

export const darkColors = {
  // Backgrounds
  background: palette.gray950,
  backgroundSecondary: '#0F0F1A',
  backgroundTertiary: '#141420',
  surface: 'rgba(255, 255, 255, 0.05)',
  surfaceHover: 'rgba(255, 255, 255, 0.08)',
  surfaceActive: 'rgba(255, 255, 255, 0.12)',
  card: 'rgba(255, 255, 255, 0.06)',
  cardBorder: 'rgba(255, 255, 255, 0.1)',

  // Text
  textPrimary: palette.white,
  textSecondary: 'rgba(255, 255, 255, 0.65)',
  textTertiary: 'rgba(255, 255, 255, 0.4)',
  textDisabled: 'rgba(255, 255, 255, 0.25)',
  textInverse: palette.gray950,

  // Brand
  primary: palette.purple600,
  primaryLight: palette.purple400,
  primaryDark: palette.purple800,
  secondary: palette.cyan500,
  secondaryLight: palette.cyan300,

  // Status
  success: palette.emerald500,
  successLight: palette.emerald400,
  warning: palette.amber500,
  warningLight: palette.amber400,
  error: palette.red500,
  errorLight: palette.red400,

  // UI Elements
  border: 'rgba(255, 255, 255, 0.1)',
  borderStrong: 'rgba(255, 255, 255, 0.2)',
  divider: 'rgba(255, 255, 255, 0.06)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.5)',

  // Tab bar
  tabBar: '#0D0D1A',
  tabBarBorder: 'rgba(255, 255, 255, 0.08)',
  tabActive: palette.purple500,
  tabInactive: 'rgba(255, 255, 255, 0.35)',
} as const;

export const lightColors = {
  background: palette.gray50,
  backgroundSecondary: palette.white,
  backgroundTertiary: palette.gray100,
  surface: 'rgba(0, 0, 0, 0.03)',
  surfaceHover: 'rgba(0, 0, 0, 0.05)',
  surfaceActive: 'rgba(0, 0, 0, 0.08)',
  card: palette.white,
  cardBorder: 'rgba(0, 0, 0, 0.08)',

  textPrimary: palette.gray900,
  textSecondary: palette.gray600,
  textTertiary: palette.gray400,
  textDisabled: palette.gray300,
  textInverse: palette.white,

  primary: palette.purple600,
  primaryLight: palette.purple400,
  primaryDark: palette.purple800,
  secondary: palette.cyan500,
  secondaryLight: palette.cyan300,

  success: palette.emerald500,
  successLight: palette.emerald400,
  warning: palette.amber500,
  warningLight: palette.amber400,
  error: palette.red500,
  errorLight: palette.red400,

  border: 'rgba(0, 0, 0, 0.1)',
  borderStrong: 'rgba(0, 0, 0, 0.2)',
  divider: 'rgba(0, 0, 0, 0.06)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.15)',

  tabBar: palette.white,
  tabBarBorder: 'rgba(0, 0, 0, 0.08)',
  tabActive: palette.purple600,
  tabInactive: palette.gray400,
} as const;

export type ColorScheme = typeof darkColors;
