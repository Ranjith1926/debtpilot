export * from './colors';
export * from './gradients';
export * from './typography';
export * from './spacing';

import { darkColors, lightColors, ColorScheme } from './colors';
import { gradients } from './gradients';
import { fontFamily, fontSize, textVariants, fontWeight } from './typography';
import { spacing, borderRadius, shadow } from './spacing';

export const createTheme = (isDark: boolean) => ({
  colors: isDark ? darkColors : lightColors,
  gradients,
  typography: { fontFamily, fontSize, textVariants, fontWeight },
  spacing,
  borderRadius,
  shadow,
  isDark,
});

export type AppTheme = ReturnType<typeof createTheme>;
