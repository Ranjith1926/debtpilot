import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { AnimatedProgressRing } from './AnimatedProgressRing';
import { FinancialHealthScore } from '@/types/health.types';

interface HealthScoreWidgetProps {
  health: FinancialHealthScore;
  onPress?: () => void;
  compact?: boolean;
}

const getScoreGradient = (score: number): [string, string] => {
  if (score >= 80) return ['#059669', '#10B981'];
  if (score >= 60) return ['#0891B2', '#06B6D4'];
  if (score >= 40) return ['#D97706', '#F59E0B'];
  return ['#DC2626', '#EF4444'];
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return { label: 'Excellent', desc: 'Your finances are in great shape' };
  if (score >= 60) return { label: 'Good', desc: 'Minor improvements recommended' };
  if (score >= 40) return { label: 'Average', desc: 'Several areas need attention' };
  return { label: 'Needs Work', desc: 'Take action to improve' };
};

const HealthScoreWidget = memo<HealthScoreWidgetProps>(({ health, onPress, compact = false }) => {
  const { theme } = useTheme();
  const gradient = getScoreGradient(health.overallScore);
  const { label, desc } = getScoreLabel(health.overallScore);

  if (compact) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.compactContainer}>
        <LinearGradient colors={gradient} style={styles.compactScore}>
          <Text style={styles.compactScoreText}>{health.overallScore}</Text>
        </LinearGradient>
        <View style={styles.compactInfo}>
          <Text style={[textVariants.titleSmall, { color: theme.colors.textPrimary }]}>{label}</Text>
          <Text style={[textVariants.caption, { color: theme.colors.textSecondary }]}>Health Score</Text>
        </View>
        <Ionicons name={health.trend === 'up' ? 'trending-up' : health.trend === 'down' ? 'trending-down' : 'remove'} size={18} color={health.trend === 'up' ? '#10B981' : health.trend === 'down' ? '#EF4444' : '#F59E0B'} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <MotiView from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }}>
        <LinearGradient colors={[`${gradient[0]}22`, `${gradient[1]}11`]} style={styles.container}>
          <View style={styles.topRow}>
            <View>
              <Text style={[textVariants.titleMedium, { color: theme.colors.textSecondary }]}>Financial Health</Text>
              <Text style={[textVariants.headlineLarge, { color: theme.colors.textPrimary, marginTop: 2 }]}>{label}</Text>
            </View>
            <AnimatedProgressRing
              progress={health.overallScore}
              size={72}
              strokeWidth={7}
              color={gradient[0]}
              label={`${health.overallScore}`}
              sublabel="/100"
            />
          </View>

          <Text style={[textVariants.bodySmall, { color: theme.colors.textSecondary, marginTop: spacing[2] }]}>{desc}</Text>

          {/* Metric bars */}
          <View style={styles.metrics}>
            {health.metrics.slice(0, 3).map((m) => (
              <View key={m.label} style={styles.metricRow}>
                <Text style={[textVariants.caption, { color: theme.colors.textSecondary, width: 100 }]} numberOfLines={1}>{m.label}</Text>
                <View style={[styles.metricBar, { backgroundColor: theme.colors.border }]}>
                  <LinearGradient
                    colors={gradient}
                    style={[styles.metricFill, { width: `${(m.score / m.maxScore) * 100}%` }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
                <Text style={[textVariants.caption, { color: theme.colors.textPrimary, width: 28, textAlign: 'right' }]}>{m.score}</Text>
              </View>
            ))}
          </View>

          {/* Trend badge */}
          <View style={styles.trendRow}>
            <Ionicons
              name={health.trend === 'up' ? 'trending-up' : health.trend === 'down' ? 'trending-down' : 'remove-outline'}
              size={14}
              color={health.trend === 'up' ? '#10B981' : '#EF4444'}
            />
            <Text style={[textVariants.caption, { color: health.trend === 'up' ? '#10B981' : '#EF4444', marginLeft: spacing[1] }]}>
              {health.trend === 'up' ? `+${health.trendValue}` : health.trend === 'down' ? `-${health.trendValue}` : '0'} points this month
            </Text>
          </View>
        </LinearGradient>
      </MotiView>
    </TouchableOpacity>
  );
});

HealthScoreWidget.displayName = 'HealthScoreWidget';
export default HealthScoreWidget;

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    overflow: 'hidden',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metrics: { marginTop: spacing[4], gap: spacing[2] },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  metricBar: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  metricFill: { height: 4, borderRadius: 2 },
  trendRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing[4] },
  compactContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  compactScore: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  compactScoreText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  compactInfo: { flex: 1 },
});
