import React, { memo } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useTheme } from '@theme/ThemeProvider';
import { useHaptics } from '@hooks/useHaptics';
import { borderRadius, spacing } from '@theme/spacing';
import { textVariants } from '@theme/typography';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const GradientButton = memo<GradientButtonProps>(({
  title, onPress, variant = 'primary', size = 'md',
  isLoading, disabled, fullWidth = true, icon, style, textStyle,
}) => {
  const { theme } = useTheme();
  const haptics = useHaptics();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 20, stiffness: 300 });
    opacity.value = withTiming(0.85, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    haptics.medium();
    onPress();
  };

  const gradients: Record<string, string[]> = {
    primary: theme.gradients.primary,
    secondary: theme.gradients.cyan,
    success: theme.gradients.success,
    danger: theme.gradients.danger,
    outline: ['transparent', 'transparent'],
    ghost: ['transparent', 'transparent'],
  };

  const heights: Record<string, number> = { sm: 40, md: 52, lg: 60 };
  const fontSizes: Record<string, TextStyle> = {
    sm: textVariants.labelMedium,
    md: textVariants.titleLarge,
    lg: textVariants.headlineSmall,
  };

  const isTransparent = variant === 'outline' || variant === 'ghost';

  return (
    <AnimatedTouchable
      style={[animatedStyle, fullWidth && styles.fullWidth]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isLoading}
      activeOpacity={1}
    >
      <LinearGradient
        colors={disabled ? ['#3A3A4A', '#2A2A3A'] : (gradients[variant] as [string, string])}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          { height: heights[size], borderRadius: borderRadius.xl },
          isTransparent && {
            borderWidth: variant === 'outline' ? 1.5 : 0,
            borderColor: theme.colors.primary,
          },
          style,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color={theme.colors.textPrimary} size="small" />
        ) : (
          <>
            {icon}
            <Text style={[fontSizes[size], styles.text, { color: theme.colors.textPrimary }, textStyle]}>
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </AnimatedTouchable>
  );
});

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  gradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2], paddingHorizontal: spacing[5] },
  text: { letterSpacing: 0.3 },
});

GradientButton.displayName = 'GradientButton';
export default GradientButton;
