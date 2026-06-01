import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useMonthlyAnalytics, useLoanDistribution } from '@hooks/useAnalytics';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { formatCurrency } from '@utils/format';
import { GlassCard, AnalyticsChart, AnimatedProgressRing } from '@components/ui/index';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 82 : 62;

export default function AnalyticsScreen() {
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'payments' | 'distribution'>('payments');
  const { data: monthly, isLoading: monthlyLoading } = useMonthlyAnalytics();
  const { data: distribution, isLoading: distLoading } = useLoanDistribution();

  const barData = (monthly ?? []).map((m) => ({
    value: Math.round(m.totalPaid / 1000),
    label: m.month,
    frontColor: '#7C3AED',
  }));

  const lineData = (monthly ?? []).map((m) => ({
    value: Math.round(m.interestPaid / 1000),
    label: m.month,
  }));

  const totalPaid = (monthly ?? []).reduce((sum, m) => sum + m.totalPaid, 0);
  const totalInterest = (monthly ?? []).reduce((sum, m) => sum + m.interestPaid, 0);
  const totalPrincipal = totalPaid - totalInterest;

  const bgColors = isDark
    ? ['#0A0A0F', '#0F0F1A'] as const
    : ['#F0F2FF', '#F8F9FF'] as const;

  const summaryCards = [
    { label: 'Total Paid', value: totalPaid, gradient: theme.gradients.primary, icon: 'cash-outline' as const },
    { label: 'Interest Paid', value: totalInterest, gradient: theme.gradients.danger, icon: 'trending-up-outline' as const },
    { label: 'Principal Paid', value: totalPrincipal, gradient: theme.gradients.success, icon: 'shield-checkmark-outline' as const },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + spacing[6] }}
      >
        {/* Header */}
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.header}>
          <Text style={[textVariants.headlineLarge, { color: theme.colors.textPrimary }]}>Analytics</Text>
          <Text style={[textVariants.bodySmall, { color: theme.colors.textSecondary }]}>2024 Overview</Text>
        </MotiView>

        {/* Summary Cards */}
        <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 100 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.summaryCards}
          >
            {summaryCards.map((card, i) => (
              <LinearGradient
                key={card.label}
                colors={card.gradient as [string, string]}
                style={[styles.summaryCard, { width: Math.max(140, SCREEN_WIDTH * 0.38) }]}
              >
                <Ionicons name={card.icon} size={22} color="rgba(255,255,255,0.9)" />
                <Text style={[textVariants.headlineSmall, { color: '#fff', marginTop: spacing[2] }]}>
                  {formatCurrency(card.value, true)}
                </Text>
                <Text style={[textVariants.caption, { color: 'rgba(255,255,255,0.75)', marginTop: 2 }]}>{card.label}</Text>
              </LinearGradient>
            ))}
          </ScrollView>
        </MotiView>

        <View style={styles.content}>
          {/* Tab Switcher */}
          <View style={[styles.tabRow, { backgroundColor: theme.colors.surface }]}>
            {(['payments', 'distribution'] as const).map((tab) => {
              const isActive = activeTab === tab;
              const label = tab === 'payments' ? 'Payments' : 'Distribution';
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[styles.tab, { overflow: 'hidden' }]}
                  activeOpacity={0.8}
                >
                  {isActive && (
                    <LinearGradient
                      colors={theme.gradients.primary as [string, string]}
                      style={StyleSheet.absoluteFill}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  )}
                  <Text numberOfLines={1} style={[textVariants.labelMedium, { color: isActive ? '#fff' : theme.colors.textSecondary }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Charts */}
          {activeTab === 'payments' ? (
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} key="payments">
              <GlassCard style={styles.chartCard}>
                <Text style={[textVariants.titleLarge, { color: theme.colors.textPrimary, marginBottom: spacing[4] }]}>
                  Monthly EMI Payments (₹K)
                </Text>
                {!monthlyLoading && barData.length > 0 && (
                  <AnalyticsChart type="bar" data={barData} color="#7C3AED" />
                )}
              </GlassCard>

              <GlassCard style={styles.chartCard}>
                <Text style={[textVariants.titleLarge, { color: theme.colors.textPrimary, marginBottom: spacing[4] }]}>
                  Interest Trend (₹K)
                </Text>
                {!monthlyLoading && lineData.length > 0 && (
                  <AnalyticsChart type="line" data={lineData} color="#EF4444" />
                )}
              </GlassCard>
            </MotiView>
          ) : (
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} key="distribution">
              <GlassCard style={styles.chartCard}>
                <Text style={[textVariants.titleLarge, { color: theme.colors.textPrimary, marginBottom: spacing[4] }]}>
                  Loan Distribution
                </Text>
                {!distLoading && (distribution ?? []).map((item, i) => (
                  <View key={item.type} style={styles.distRow}>
                    <View style={styles.distHeader}>
                      <View style={styles.distLabel}>
                        <View style={[styles.distDot, { backgroundColor: item.color }]} />
                        <Text style={[textVariants.bodyMedium, { color: theme.colors.textPrimary }]}>{item.type}</Text>
                      </View>
                      <View style={styles.distRight}>
                        <Text style={[textVariants.titleMedium, { color: theme.colors.textPrimary }]}>
                          {formatCurrency(item.amount, true)}
                        </Text>
                        <Text style={[textVariants.caption, { color: theme.colors.textSecondary }]}>
                          {item.percentage}%
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.distTrack, { backgroundColor: theme.colors.border }]}>
                      <MotiView
                        from={{ scaleX: 0 }}
                        animate={{ scaleX: item.percentage / 100 }}
                        transition={{ type: 'timing', duration: 900, delay: i * 120 }}
                        style={[styles.distFill, { backgroundColor: item.color }]}
                      />
                    </View>
                  </View>
                ))}
              </GlassCard>

              <GlassCard style={styles.chartCard}>
                <Text style={[textVariants.titleLarge, { color: theme.colors.textPrimary, marginBottom: spacing[4] }]}>
                  Financial Health
                </Text>
                <View style={styles.healthRow}>
                  <AnimatedProgressRing
                    progress={72}
                    size={Math.min(120, SCREEN_WIDTH * 0.3)}
                    strokeWidth={8}
                    label="72"
                    sublabel="Good"
                    gradientColors={['#06B6D4', '#10B981']}
                  />
                  <View style={styles.healthMetrics}>
                    {[
                      { label: 'Payment History', score: 85, color: '#10B981' },
                      { label: 'DTI Ratio', score: 58, color: '#F59E0B' },
                      { label: 'Loan Diversity', score: 75, color: '#7C3AED' },
                    ].map((m) => (
                      <View key={m.label} style={styles.metricItem}>
                        <View style={styles.metricHeader}>
                          <Text numberOfLines={1} style={[textVariants.caption, { color: theme.colors.textSecondary, flex: 1 }]}>{m.label}</Text>
                          <Text style={[textVariants.caption, { color: m.color }]}>{m.score}%</Text>
                        </View>
                        <View style={[styles.metricTrack, { backgroundColor: theme.colors.border }]}>
                          <LinearGradient
                            colors={[m.color, `${m.color}80`]}
                            style={[styles.metricFill, { width: `${m.score}%` }]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </GlassCard>
            </MotiView>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing[5],
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: spacing[3],
  },
  summaryCards: {
    paddingHorizontal: spacing[5],
    gap: spacing[3],
    paddingBottom: spacing[3],
  },
  summaryCard: { borderRadius: borderRadius.xl, padding: spacing[4] },
  content: { paddingHorizontal: spacing[5] },
  tabRow: {
    flexDirection: 'row',
    borderRadius: borderRadius.xl,
    padding: spacing[1],
    marginBottom: spacing[4],
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[2.5],
    borderRadius: borderRadius.lg,
  },
  chartCard: { marginBottom: spacing[4] },
  distRow: { marginBottom: spacing[3] },
  distHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[1.5] },
  distLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], flex: 1 },
  distDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  distRight: { alignItems: 'flex-end', marginLeft: spacing[2] },
  distTrack: { height: 5, borderRadius: 3, overflow: 'hidden' },
  distFill: { height: '100%', width: '100%', borderRadius: 3 },
  healthRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[4] },
  healthMetrics: { flex: 1, gap: spacing[3] },
  metricItem: {},
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[1] },
  metricTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  metricFill: { height: '100%', borderRadius: 2 },
});
