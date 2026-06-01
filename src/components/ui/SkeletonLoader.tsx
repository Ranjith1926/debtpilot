import React, { memo, useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@theme/ThemeProvider';
import { borderRadius, spacing } from '@theme/spacing';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton = memo<SkeletonProps>(({ width = '100%', height = 16, borderRadius: br = 8, style }) => {
  const { theme } = useTheme();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0.4, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1,
      false,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ width, height, borderRadius: br, backgroundColor: theme.colors.surface }, animStyle, style]}
    />
  );
});

export const CardSkeleton = memo(() => (
  <View style={styles.cardSkeleton}>
    <View style={styles.row}>
      <Skeleton width={44} height={44} borderRadius={borderRadius.md} />
      <View style={styles.info}>
        <Skeleton width="60%" height={14} />
        <Skeleton width="40%" height={10} style={{ marginTop: 6 }} />
      </View>
    </View>
    <Skeleton width="100%" height={10} style={{ marginTop: spacing[3] }} />
    <Skeleton width="70%" height={10} style={{ marginTop: 6 }} />
    <Skeleton width="100%" height={6} borderRadius={3} style={{ marginTop: spacing[3] }} />
  </View>
));

export const StatsSkeleton = memo(() => (
  <View style={styles.statsRow}>
    {[1, 2].map((i) => (
      <View key={i} style={styles.statCard}>
        <Skeleton width={36} height={36} borderRadius={borderRadius.md} />
        <Skeleton width="60%" height={20} style={{ marginTop: spacing[2] }} />
        <Skeleton width="80%" height={10} style={{ marginTop: spacing[1] }} />
      </View>
    ))}
  </View>
));

const styles = StyleSheet.create({
  cardSkeleton: { padding: spacing[4], borderRadius: borderRadius.xl, backgroundColor: 'rgba(255,255,255,0.04)', marginBottom: spacing[3] },
  row: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, marginLeft: spacing[3] },
  statsRow: { flexDirection: 'row', gap: spacing[3], marginBottom: spacing[3] },
  statCard: { flex: 1, padding: spacing[4], borderRadius: borderRadius.xl, backgroundColor: 'rgba(255,255,255,0.04)' },
});
