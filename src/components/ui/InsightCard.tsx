import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { formatCurrency } from '@utils/format';
import { AIInsight } from '@/types/analytics.types';

interface InsightCardProps {
  insight: AIInsight;
  onPress?: () => void;
  onAction?: () => void;
  index?: number;
}

const insightConfig = {
  opportunity: { icon: 'bulb' as const, gradient: ['#7C3AED', '#06B6D4'] as string[], label: 'Opportunity' },
  warning: { icon: 'warning' as const, gradient: ['#EF4444', '#F59E0B'] as string[], label: 'Warning' },
  tip: { icon: 'information-circle' as const, gradient: ['#06B6D4', '#10B981'] as string[], label: 'Tip' },
  achievement: { icon: 'trophy' as const, gradient: ['#F59E0B', '#FBBF24'] as string[], label: 'Achievement' },
};

const InsightCard = memo<InsightCardProps>(({ insight, onPress, onAction, index = 0 }) => {
  const { theme } = useTheme();
  const config = insightConfig[insight.type];

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', delay: index * 80 }}
    >
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder, opacity: insight.isRead ? 0.7 : 1 }]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <View style={styles.header}>
          <LinearGradient colors={config.gradient as [string, string]} style={styles.iconBg}>
            <Ionicons name={config.icon} size={18} color="#fff" />
          </LinearGradient>
          <View style={styles.headerText}>
            <View style={styles.typeRow}>
              <Text style={[textVariants.labelSmall, { color: config.gradient[0] }]}>{config.label}</Text>
              {!insight.isRead && <View style={[styles.unreadDot, { backgroundColor: config.gradient[0] }]} />}
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: insight.priority === 'high' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)' }]}>
              <Text style={[textVariants.labelSmall, { color: insight.priority === 'high' ? theme.colors.error : theme.colors.warning, fontSize: 10 }]}>
                {insight.priority.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
        <Text style={[textVariants.titleMedium, { color: theme.colors.textPrimary, marginTop: spacing[2] }]}>
          {insight.title}
        </Text>
        <Text style={[textVariants.bodySmall, { color: theme.colors.textSecondary, marginTop: spacing[1] }]} numberOfLines={3}>
          {insight.description}
        </Text>
        {insight.savingsEstimate && (
          <View style={styles.savings}>
            <Ionicons name="cash" size={14} color={theme.colors.success} />
            <Text style={[textVariants.labelMedium, { color: theme.colors.success, marginLeft: spacing[1] }]}>
              Save up to {formatCurrency(insight.savingsEstimate)}
            </Text>
          </View>
        )}
        {insight.actionLabel && (
          <TouchableOpacity style={[styles.actionBtn, { borderColor: config.gradient[0] }]} onPress={onAction}>
            <Text style={[textVariants.labelMedium, { color: config.gradient[0] }]}>{insight.actionLabel}</Text>
            <Ionicons name="arrow-forward" size={14} color={config.gradient[0]} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </MotiView>
  );
});

const styles = StyleSheet.create({
  card: { borderRadius: borderRadius.xl, padding: spacing[4], marginBottom: spacing[3], borderWidth: 1 },
  header: { flexDirection: 'row', alignItems: 'center' },
  iconBg: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing[3] },
  headerText: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  unreadDot: { width: 6, height: 6, borderRadius: 3 },
  priorityBadge: { paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: borderRadius.full },
  savings: { flexDirection: 'row', alignItems: 'center', marginTop: spacing[3], padding: spacing[2], backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: borderRadius.md },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[1], marginTop: spacing[3], paddingVertical: spacing[2], borderRadius: borderRadius.lg, borderWidth: 1 },
});

InsightCard.displayName = 'InsightCard';
export default InsightCard;
