import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue, useAnimatedProps, withTiming, Easing,
} from 'react-native-reanimated';
import { textVariants } from '@theme/typography';
import { useTheme } from '@theme/ThemeProvider';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AnimatedProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  gradientColors?: string[];
  trackColor?: string;
  showPercentage?: boolean;
}

const AnimatedProgressRing = memo<AnimatedProgressRingProps>(({
  progress,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  gradientColors = ['#7C3AED', '#06B6D4'],
  trackColor,
  showPercentage = true,
}) => {
  const { theme } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(Math.min(progress, 100) / 100, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  const gradientId = `ring-gradient-${Math.round(size)}`;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <SvgGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradientColors[0]} />
            <Stop offset="100%" stopColor={gradientColors[1] ?? gradientColors[0]} />
          </SvgGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor ?? theme.colors.border}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.content}>
        {showPercentage && (
          <Text style={[textVariants.headlineMedium, { color: theme.colors.textPrimary }]}>
            {label ?? `${progress}`}
          </Text>
        )}
        {sublabel && (
          <Text style={[textVariants.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
            {sublabel}
          </Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  svg: { position: 'absolute' },
  content: { alignItems: 'center', justifyContent: 'center' },
});

AnimatedProgressRing.displayName = 'AnimatedProgressRing';
export default AnimatedProgressRing;
