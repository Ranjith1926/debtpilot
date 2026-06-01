import React, { memo } from 'react';
import { StyleSheet, ViewStyle, TouchableOpacity, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import { useTheme } from '@theme/ThemeProvider';
import { borderRadius, shadow, spacing } from '@theme/spacing';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'bordered';
  intensity?: number;
  animationDelay?: number;
  padding?: number;
  noPadding?: boolean;
}

const GlassCard = memo<GlassCardProps>(({
  children, style, onPress, variant = 'default',
  intensity = 20, animationDelay = 0, padding, noPadding,
}) => {
  const { theme, isDark } = useTheme();

  const cardPadding = noPadding ? 0 : (padding ?? spacing[4]);

  const solidBg = isDark
    ? variant === 'elevated' ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.06)'
    : variant === 'elevated' ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.92)';

  const borderColor = isDark
    ? variant === 'bordered' ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.1)'
    : variant === 'bordered' ? 'rgba(124,58,237,0.4)' : 'rgba(0,0,0,0.07)';

  const containerStyle: ViewStyle[] = [
    styles.base,
    {
      backgroundColor: solidBg,
      borderColor,
      borderWidth: 1,
      // Padding applied directly here so children have the full width
      padding: cardPadding,
    },
    shadow.sm,
    style ?? {},
  ];

  const inner = (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 130, delay: animationDelay }}
      style={containerStyle}
    >
      {/* iOS-only blur overlay, positioned absolute so it doesn't affect layout */}
      {Platform.OS === 'ios' && (
        <BlurView
          intensity={isDark ? intensity : intensity * 0.4}
          tint={isDark ? 'dark' : 'light'}
          style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.xl }]}
          pointerEvents="none"
        />
      )}
      {children}
    </MotiView>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {inner}
      </TouchableOpacity>
    );
  }

  return inner;
});

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
});

GlassCard.displayName = 'GlassCard';
export default GlassCard;
