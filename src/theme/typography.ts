import { Platform } from 'react-native';

export const fontFamily = {
  regular: Platform.select({ ios: 'SF Pro Display', android: 'Roboto', default: 'System' }),
  medium: Platform.select({ ios: 'SF Pro Display', android: 'Roboto-Medium', default: 'System' }),
  semiBold: Platform.select({ ios: 'SF Pro Display', android: 'Roboto-Medium', default: 'System' }),
  bold: Platform.select({ ios: 'SF Pro Display', android: 'Roboto-Bold', default: 'System' }),
  mono: Platform.select({ ios: 'SF Mono', android: 'monospace', default: 'monospace' }),
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
  '6xl': 48,
} as const;

export const lineHeight = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.65,
  loose: 2,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
  black: '900' as const,
};

export const textVariants = {
  displayLarge: { fontSize: fontSize['5xl'], fontWeight: fontWeight.bold, lineHeight: fontSize['5xl'] * lineHeight.tight },
  displayMedium: { fontSize: fontSize['4xl'], fontWeight: fontWeight.bold, lineHeight: fontSize['4xl'] * lineHeight.tight },
  displaySmall: { fontSize: fontSize['3xl'], fontWeight: fontWeight.bold, lineHeight: fontSize['3xl'] * lineHeight.snug },
  headlineLarge: { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, lineHeight: fontSize['2xl'] * lineHeight.snug },
  headlineMedium: { fontSize: fontSize.xl, fontWeight: fontWeight.semiBold, lineHeight: fontSize.xl * lineHeight.snug },
  headlineSmall: { fontSize: fontSize.lg, fontWeight: fontWeight.semiBold, lineHeight: fontSize.lg * lineHeight.normal },
  titleLarge: { fontSize: fontSize.base, fontWeight: fontWeight.semiBold, lineHeight: fontSize.base * lineHeight.normal },
  titleMedium: { fontSize: fontSize.md, fontWeight: fontWeight.medium, lineHeight: fontSize.md * lineHeight.normal },
  titleSmall: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, lineHeight: fontSize.sm * lineHeight.normal },
  bodyLarge: { fontSize: fontSize.base, fontWeight: fontWeight.regular, lineHeight: fontSize.base * lineHeight.relaxed },
  bodyMedium: { fontSize: fontSize.md, fontWeight: fontWeight.regular, lineHeight: fontSize.md * lineHeight.relaxed },
  bodySmall: { fontSize: fontSize.sm, fontWeight: fontWeight.regular, lineHeight: fontSize.sm * lineHeight.relaxed },
  labelLarge: { fontSize: fontSize.md, fontWeight: fontWeight.medium, lineHeight: fontSize.md * lineHeight.normal, letterSpacing: 0.1 },
  labelMedium: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, lineHeight: fontSize.sm * lineHeight.normal, letterSpacing: 0.5 },
  labelSmall: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, lineHeight: fontSize.xs * lineHeight.normal, letterSpacing: 0.5 },
  amount: { fontSize: fontSize['3xl'], fontWeight: fontWeight.bold, fontFamily: fontFamily.mono },
  amountLarge: { fontSize: fontSize['4xl'], fontWeight: fontWeight.black, fontFamily: fontFamily.mono },
  caption: { fontSize: fontSize.xs, fontWeight: fontWeight.regular, lineHeight: fontSize.xs * lineHeight.normal },
} as const;
