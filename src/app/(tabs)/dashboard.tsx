import React, { useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useAppSelector } from '@store/hooks';
import { useLoanSummary, useUpcomingEMIs } from '@hooks/useLoans';
import { useInsights } from '@hooks/useAnalytics';
import { useNotifications } from '@hooks/useNotifications';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { formatCurrency, formatDateShort } from '@utils/format';
import { getGreeting, getHealthScoreLabel } from '@utils/loan.utils';
import {
  GlassCard, AnimatedProgressRing, FinancialStatCard,
  EMIListCard, InsightCard, FloatingActionButton,
  CardSkeleton, StatsSkeleton,
} from '@components/ui/index';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 82 : 62;

export default function DashboardScreen() {
  const { theme, isDark } = useTheme();
  const user = useAppSelector((s) => s.auth.user);
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useLoanSummary();
  const { data: emis, isLoading: emisLoading, refetch: refetchEMIs } = useUpcomingEMIs();
  const { data: insightsData } = useInsights();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchSummary(), refetchEMIs()]);
    setRefreshing(false);
  }, [refetchSummary, refetchEMIs]);

  const { unreadCount } = useNotifications();
  const healthInfo = summary ? getHealthScoreLabel(user?.financialHealthScore ?? 72) : null;
  const insights = insightsData?.data?.slice(0, 2) ?? [];
  const upcomingEMIs = emis?.data?.slice(0, 3) ?? [];

  const quickActions = [
    { label: 'Add Loan', icon: 'add-circle' as const, route: '/loan/add', gradient: theme.gradients.primary },
    { label: 'Analytics', icon: 'bar-chart' as const, route: '/(tabs)/analytics', gradient: theme.gradients.cyan },
    { label: 'Insights', icon: 'bulb' as const, route: '/ai-insights', gradient: theme.gradients.success },
    { label: 'Reminders', icon: 'notifications' as const, route: '/reminders', gradient: theme.gradients.gold },
  ];

  const bgColors = isDark
    ? ['#0A0A0F', '#0F0F1A', '#0A0A0F'] as const
    : ['#F0F2FF', '#F8F9FF', '#F0F2FF'] as const;

  const heroColors = isDark
    ? ['#1A0A2E', '#0A1628', '#0A0A1A'] as const
    : ['#EDE9FE', '#DBEAFE', '#EDE9FE'] as const;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} />
      <View style={[styles.orb1, { opacity: isDark ? 1 : 0.4 }]} />
      <View style={[styles.orb2, { opacity: isDark ? 1 : 0.3 }]} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: TAB_BAR_HEIGHT + spacing[6] }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {/* Header */}
        <MotiView from={{ opacity: 0, translateY: -20 }} animate={{ opacity: 1, translateY: 0 }} style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[textVariants.bodyMedium, { color: theme.colors.textSecondary }]}>
              {getGreeting()},
            </Text>
            <Text style={[textVariants.headlineLarge, { color: theme.colors.textPrimary }]}>
              {user?.name?.split(' ')[0] ?? 'User'} 👋
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={20} color={theme.colors.textPrimary} />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
                <Text style={[styles.badgeText, { color: '#fff' }]}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </MotiView>

        {/* Overdue Alert */}
        {summary && summary.overdueCount > 0 && (
          <MotiView from={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 80 }}>
            <TouchableOpacity style={[styles.overdueAlert, { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }]}>
              <Ionicons name="warning" size={15} color={theme.colors.error} />
              <Text style={[textVariants.labelMedium, { color: theme.colors.error, marginLeft: spacing[2], flex: 1 }]}>
                {summary.overdueCount} overdue payment — ₹{summary.overdueAmount.toLocaleString('en-IN')}
              </Text>
              <Ionicons name="chevron-forward" size={15} color={theme.colors.error} />
            </TouchableOpacity>
          </MotiView>
        )}

        {/* Hero Card */}
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 120 }}>
          <LinearGradient colors={heroColors} style={[styles.heroCard, { borderColor: theme.colors.cardBorder, borderWidth: 1 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.heroContent}>
              <View style={styles.heroLeft}>
                <Text style={[textVariants.labelMedium, { color: theme.colors.textSecondary }]}>Total Outstanding</Text>
                <Text style={[textVariants.amountLarge, { color: theme.colors.textPrimary, marginTop: spacing[1], fontSize: Math.min(36, SCREEN_WIDTH * 0.09) }]}>
                  {summaryLoading ? '—' : formatCurrency(summary?.totalOutstanding ?? 0, true)}
                </Text>
                <View style={styles.heroStats}>
                  <View>
                    <Text style={[textVariants.caption, { color: theme.colors.textSecondary }]}>Monthly EMI</Text>
                    <Text style={[textVariants.titleLarge, { color: theme.colors.textPrimary, fontWeight: '700' }]}>
                      {summaryLoading ? '—' : formatCurrency(summary?.totalEMIPerMonth ?? 0)}
                    </Text>
                  </View>
                  <View style={styles.heroDivider} />
                  <View>
                    <Text style={[textVariants.caption, { color: theme.colors.textSecondary }]}>Next Due</Text>
                    <Text style={[textVariants.titleLarge, { color: theme.colors.warning, fontWeight: '700' }]}>
                      {summaryLoading ? '—' : formatDateShort(summary?.nextEMIDue ?? '')}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.heroRight}>
                <AnimatedProgressRing
                  progress={user?.financialHealthScore ?? 72}
                  size={Math.min(100, SCREEN_WIDTH * 0.25)}
                  strokeWidth={8}
                  gradientColors={healthInfo?.gradient ?? ['#06B6D4', '#10B981']}
                  label={`${user?.financialHealthScore ?? 72}`}
                  sublabel={healthInfo?.label ?? 'Good'}
                />
              </View>
            </View>
          </LinearGradient>
        </MotiView>

        {/* Stats Row */}
        {summaryLoading ? <StatsSkeleton /> : (
          <View style={styles.statsRow}>
            <FinancialStatCard
              label="Active Loans"
              value={summary?.activeLoans ?? 0}
              icon="layers-outline"
              animationDelay={180}
            />
            <FinancialStatCard
              label="Paid This Year"
              value={summary?.totalPaidThisYear ?? 0}
              isCurrency
              compact
              icon="checkmark-circle-outline"
              gradient={theme.gradients.success}
              animationDelay={240}
            />
          </View>
        )}

        {/* Quick Actions */}
        <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 280 }}>
          <Text style={[textVariants.headlineSmall, { color: theme.colors.textPrimary, marginBottom: spacing[3] }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActions}>
            {quickActions.map((action) => (
              <TouchableOpacity key={action.label} onPress={() => router.push(action.route as any)} style={styles.quickAction}>
                <LinearGradient colors={action.gradient as [string, string]} style={styles.quickActionIcon}>
                  <Ionicons name={action.icon} size={22} color="#fff" />
                </LinearGradient>
                <Text style={[textVariants.labelSmall, { color: theme.colors.textSecondary, marginTop: spacing[1.5], textAlign: 'center', fontSize: 11 }]} numberOfLines={1}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </MotiView>

        {/* Upcoming EMIs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[textVariants.headlineSmall, { color: theme.colors.textPrimary }]}>Upcoming EMIs</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/loans')}>
              <Text style={[textVariants.labelMedium, { color: theme.colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          {emisLoading ? (
            <><CardSkeleton /><CardSkeleton /></>
          ) : (
            upcomingEMIs.map((emi, i) => (
              <EMIListCard
                key={emi.id}
                emi={emi}
                index={i}
                onPress={() => router.push(`/loan/${emi.loanId}`)}
              />
            ))
          )}
        </View>

        {/* AI Insights */}
        {insights.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[textVariants.headlineSmall, { color: theme.colors.textPrimary }]}>AI Insights</Text>
              <TouchableOpacity onPress={() => router.push('/ai-insights')}>
                <Text style={[textVariants.labelMedium, { color: theme.colors.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>
            {insights.map((insight, i) => (
              <InsightCard key={insight.id} insight={insight} index={i} onPress={() => router.push('/ai-insights')} />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.fab}>
        <FloatingActionButton onPress={() => router.push('/loan/add')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing[5], paddingTop: Platform.OS === 'ios' ? 56 : 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[4] },
  headerLeft: { flex: 1 },
  iconBtn: { width: 42, height: 42, borderRadius: borderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 9, fontWeight: '700' },
  overdueAlert: { flexDirection: 'row', alignItems: 'center', padding: spacing[3], borderRadius: borderRadius.lg, borderWidth: 1, marginBottom: spacing[4] },
  heroCard: { borderRadius: borderRadius['2xl'], marginBottom: spacing[4], overflow: 'hidden' },
  heroContent: { flexDirection: 'row', alignItems: 'center', padding: spacing[5] },
  heroLeft: { flex: 1, marginRight: spacing[3] },
  heroRight: {},
  heroStats: { flexDirection: 'row', alignItems: 'center', marginTop: spacing[4], flexWrap: 'nowrap' },
  heroDivider: { width: StyleSheet.hairlineWidth, height: 36, backgroundColor: 'rgba(128,128,128,0.4)', marginHorizontal: spacing[4] },
  statsRow: { flexDirection: 'row', gap: spacing[3], marginBottom: spacing[4] },
  quickActions: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[5] },
  quickAction: { flex: 1, alignItems: 'center' },
  quickActionIcon: { width: 52, height: 52, borderRadius: borderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  section: { marginBottom: spacing[4] },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3] },
  orb1: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(124,58,237,0.08)', top: -80, right: -60 },
  orb2: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(6,182,212,0.06)', bottom: 200, left: -40 },
  fab: { position: 'absolute', bottom: Platform.OS === 'ios' ? 96 : 72, right: spacing[5] },
});
