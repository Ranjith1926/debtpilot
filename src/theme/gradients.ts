export const gradients = {
  primary: ['#7C3AED', '#06B6D4'] as string[],
  primaryReverse: ['#06B6D4', '#7C3AED'] as string[],
  purple: ['#7C3AED', '#9F7AEA'] as string[],
  purpleDark: ['#4C1D95', '#7C3AED'] as string[],
  cyan: ['#06B6D4', '#22D3EE'] as string[],
  gold: ['#F59E0B', '#FBBF24'] as string[],
  success: ['#059669', '#10B981'] as string[],
  danger: ['#DC2626', '#EF4444'] as string[],
  sunset: ['#7C3AED', '#EF4444', '#F59E0B'] as string[],
  ocean: ['#1E3A8A', '#06B6D4'] as string[],
  neon: ['#A855F7', '#22D3EE'] as string[],
  card: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'] as string[],
  cardDark: ['rgba(124,58,237,0.15)', 'rgba(6,182,212,0.05)'] as string[],
  overlay: ['transparent', 'rgba(10,10,15,0.9)'] as string[],
  overlayTop: ['rgba(10,10,15,0.7)', 'transparent'] as string[],
  healthExcellent: ['#059669', '#10B981'] as string[],
  healthGood: ['#0891B2', '#06B6D4'] as string[],
  healthAverage: ['#D97706', '#F59E0B'] as string[],
  healthPoor: ['#DC2626', '#EF4444'] as string[],
} as const;

export type GradientKey = keyof typeof gradients;
