import React, { memo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { Recommendation } from '@/types/health.types';
import { formatINR } from '@utils/financial.calculators';
import GlassCard from './GlassCard';

interface RecommendationCardProps {
  rec: Recommendation;
  index?: number;
  onPress?: (rec: Recommendation) => void;
}

const typeConfig: Record<string, { icon: keyof typeof Ionicons.glyphMap; gradient: [string, string]; label: string }> = {
  preclosure: { icon: 'checkmark-done-circle', gradient: ['#059669', '#10B981'], label: 'Pre-closure' },
  avalanche: { icon: 'trending-down', gradient: ['#7C3AED', '#A855F7'], label: 'Avalanche' },
  snowball: { icon: 'snow', gradient: ['#0891B2', '#06B6D4'], label: 'Snowball' },
  refinance: { icon: 'swap-horizontal', gradient: ['#D97706', '#F59E0B'], label: 'Refinance' },
  credit_improvement: { icon: 'star', gradient: ['#EC4899', '#F43F5E'], label: 'Credit' },
  emi_optimization: { icon: 'options', gradient: ['#6366F1', '#8B5CF6'], label: 'Optimize' },
};

const difficultyColor = { easy: '#10B981', medium: '#F59E0B', hard: '#EF4444' };

const RecommendationCard = memo<RecommendationCardProps>(({ rec, index = 0, onPress }) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const config = typeConfig[rec.type] ?? typeConfig.emi_optimization;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
    onPress?.(rec);
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', delay: index * 80 }}
    >
      <GlassCard style={styles.card} noPadding>
        {/* Header */}
        <TouchableOpacity onPress={toggle} activeOpacity={0.8} style={styles.header}>
          <LinearGradient colors={config.gradient} style={styles.iconBg}>
            <Ionicons name={config.icon} size={20} color="#fff" />
          </LinearGradient>

          <View style={styles.titleBlock}>
            <View style={styles.titleRow}>
              <Text style={[textVariants.titleMedium, { color: theme.colors.textPrimary, flex: 1 }]} numberOfLines={2}>
                {rec.title}
              </Text>
              {rec.priority === 'high' && (
                <View style={[styles.priorityBadge, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
                  <Text style={[textVariants.caption, { color: '#EF4444' }]}>High</Text>
                </View>
              )}
            </View>
            <View style={styles.metaRow}>
              <View style={[styles.typeBadge, { backgroundColor: `${config.gradient[0]}20` }]}>
                <Text style={[textVariants.caption, { color: config.gradient[0] }]}>{config.label}</Text>
              </View>
              <Text style={[textVariants.caption, { color: difficultyColor[rec.difficulty], marginLeft: spacing[2] }]}>
                {rec.difficulty.charAt(0).toUpperCase() + rec.difficulty.slice(1)}
              </Text>
              <Text style={[textVariants.caption, { color: theme.colors.textTertiary, marginLeft: spacing[2] }]}>
                · {rec.timeToImplement}
              </Text>
            </View>
          </View>

          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Savings highlight */}
        {rec.savingsAmount && (
          <View style={styles.savingsRow}>
            <Ionicons name="cash-outline" size={14} color="#10B981" />
            <Text style={[textVariants.labelMedium, { color: '#10B981', marginLeft: spacing[1] }]}>
              Save {formatINR(rec.savingsAmount, true)}
            </Text>
            {rec.monthlyExtraPayment && (
              <Text style={[textVariants.caption, { color: theme.colors.textSecondary, marginLeft: spacing[2] }]}>
                with +{formatINR(rec.monthlyExtraPayment, true)}/month
              </Text>
            )}
          </View>
        )}

        {/* Expanded steps */}
        {expanded && (
          <View style={styles.steps}>
            <Text style={[textVariants.labelMedium, { color: theme.colors.textSecondary, marginBottom: spacing[2] }]}>
              Action Steps:
            </Text>
            {rec.steps.map((step, i) => (
              <View key={i} style={styles.step}>
                <LinearGradient colors={config.gradient} style={styles.stepNum}>
                  <Text style={[textVariants.caption, { color: '#fff', fontSize: 10 }]}>{i + 1}</Text>
                </LinearGradient>
                <Text style={[textVariants.bodySmall, { color: theme.colors.textSecondary, flex: 1 }]}>{step}</Text>
              </View>
            ))}
          </View>
        )}
      </GlassCard>
    </MotiView>
  );
});

RecommendationCard.displayName = 'RecommendationCard';
export default RecommendationCard;

const styles = StyleSheet.create({
  card: { marginBottom: spacing[3], overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'flex-start', padding: spacing[4], gap: spacing[3] },
  iconBg: { width: 44, height: 44, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  titleBlock: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[2] },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing[1] },
  typeBadge: { paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: borderRadius.sm },
  priorityBadge: { paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: borderRadius.sm },
  savingsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], paddingBottom: spacing[3] },
  steps: { paddingHorizontal: spacing[4], paddingBottom: spacing[4], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: spacing[3] },
  step: { flexDirection: 'row', gap: spacing[3], marginBottom: spacing[3], alignItems: 'flex-start' },
  stepNum: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});
