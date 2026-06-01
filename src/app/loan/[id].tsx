import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useLoanDetail } from '@hooks/useLoans';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { formatCurrency, formatDate } from '@utils/format';
import { getLoanTypeColor } from '@utils/loan.utils';
import { GlassCard, AnimatedProgressRing, GradientButton } from '@components/ui/index';
import { LOAN_TYPE_LABELS } from '@constants/app.constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDark } = useTheme();
  const { data: loan, isLoading } = useLoanDetail(id ?? '');

  if (isLoading || !loan) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <LinearGradient
          colors={isDark ? ['#0A0A0F', '#0F0F1A'] : ['#F0F2FF', '#F8F9FF']}
          style={StyleSheet.absoluteFill}
        />
      </View>
    );
  }

  const typeColor = getLoanTypeColor(loan.type);
  const progress = ((loan.principalAmount - loan.outstandingAmount) / loan.principalAmount) * 100;
  const remainingMonths = Math.round(loan.outstandingAmount / loan.emiAmount);

  const quickStats = [
    { label: 'Total Paid', value: formatCurrency(loan.totalPaid, true), icon: 'checkmark-circle' as const, color: theme.colors.success },
    { label: 'Interest Paid', value: formatCurrency(loan.totalInterestPaid, true), icon: 'trending-up' as const, color: theme.colors.warning },
    { label: 'Remaining EMIs', value: `${remainingMonths}`, icon: 'calendar' as const, color: theme.colors.primary },
    { label: 'Savings Possible', value: loan.prepaymentAllowed ? 'Available' : 'N/A', icon: 'bulb' as const, color: theme.colors.secondary },
  ];

  const details = [
    { label: 'Loan Amount', value: formatCurrency(loan.principalAmount) },
    { label: 'Interest Rate', value: `${loan.interestRate}% p.a.` },
    { label: 'Tenure', value: `${loan.tenureMonths} months` },
    { label: 'Start Date', value: formatDate(loan.startDate) },
    { label: 'End Date', value: formatDate(loan.endDate) },
    { label: 'Account No.', value: loan.accountNumber },
    { label: 'EMI Due Date', value: `${loan.emiDueDate}th every month` },
    { label: 'Last Payment', value: loan.lastPaymentDate ? formatDate(loan.lastPaymentDate) : 'N/A' },
  ];

  const bgColors = isDark ? ['#0A0A0F', '#0F0F1A'] as const : ['#F0F2FF', '#F8F9FF'] as const;
  const ringSize = Math.min(110, SCREEN_WIDTH * 0.27);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} />

      {/* Coloured hero header */}
      <LinearGradient colors={[`${typeColor}40`, `${typeColor}10`, 'transparent']} style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)' }]}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[textVariants.titleLarge, { color: theme.colors.textPrimary, flex: 1, marginHorizontal: spacing[3] }]} numberOfLines={1}>
            {loan.lenderName}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: `${typeColor}20`, borderColor: `${typeColor}50`, borderWidth: 1 }]}>
            <Text style={[textVariants.labelSmall, { color: typeColor }]}>{loan.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Outstanding + progress ring */}
        <View style={styles.heroBody}>
          <View style={styles.heroLeft}>
            <Text style={[textVariants.labelMedium, { color: theme.colors.textSecondary }]}>
              {LOAN_TYPE_LABELS[loan.type]}
            </Text>
            <Text
              style={[textVariants.amountLarge, { color: theme.colors.textPrimary, marginTop: spacing[1], fontSize: Math.min(36, SCREEN_WIDTH * 0.09) }]}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {formatCurrency(loan.outstandingAmount, true)}
            </Text>
            <Text style={[textVariants.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
              Outstanding Balance
            </Text>
            <View style={[styles.emiChip, { backgroundColor: `${typeColor}20`, borderColor: `${typeColor}40`, borderWidth: 1 }]}>
              <Text style={[textVariants.labelMedium, { color: typeColor }]}>
                EMI: {formatCurrency(loan.emiAmount)}/mo
              </Text>
            </View>
          </View>
          <AnimatedProgressRing
            progress={Math.round(progress)}
            size={ringSize}
            strokeWidth={8}
            gradientColors={[typeColor, `${typeColor}55`]}
            label={`${Math.round(progress)}%`}
            sublabel="Done"
          />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Quick Stats — 2×2 grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            {quickStats.slice(0, 2).map((stat, i) => (
              <MotiView key={stat.label} from={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 80 }} style={styles.statCardWrapper}>
                <GlassCard style={styles.statCard}>
                  <Ionicons name={stat.icon} size={20} color={stat.color} />
                  <Text
                    style={[textVariants.headlineSmall, { color: theme.colors.textPrimary, marginTop: spacing[1.5], fontWeight: '700' }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                  >
                    {stat.value}
                  </Text>
                  <Text style={[textVariants.caption, { color: theme.colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
                    {stat.label}
                  </Text>
                </GlassCard>
              </MotiView>
            ))}
          </View>
          <View style={styles.statsRow}>
            {quickStats.slice(2, 4).map((stat, i) => (
              <MotiView key={stat.label} from={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: (i + 2) * 80 }} style={styles.statCardWrapper}>
                <GlassCard style={styles.statCard}>
                  <Ionicons name={stat.icon} size={20} color={stat.color} />
                  <Text
                    style={[textVariants.headlineSmall, { color: theme.colors.textPrimary, marginTop: spacing[1.5], fontWeight: '700' }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                  >
                    {stat.value}
                  </Text>
                  <Text style={[textVariants.caption, { color: theme.colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
                    {stat.label}
                  </Text>
                </GlassCard>
              </MotiView>
            ))}
          </View>
        </View>

        {/* Loan Details */}
        <GlassCard style={{ marginBottom: spacing[4] }}>
          <Text style={[textVariants.headlineSmall, { color: theme.colors.textPrimary, marginBottom: spacing[3] }]}>
            Loan Details
          </Text>
          {details.map((d, i) => (
            <View
              key={d.label}
              style={[
                styles.detailRow,
                i < details.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.divider },
              ]}
            >
              <Text style={[textVariants.bodyMedium, { color: theme.colors.textSecondary, flex: 1 }]}>{d.label}</Text>
              <Text style={[textVariants.titleMedium, { color: theme.colors.textPrimary, flex: 1, textAlign: 'right' }]} numberOfLines={1} adjustsFontSizeToFit>
                {d.value}
              </Text>
            </View>
          ))}
        </GlassCard>

        {/* Actions */}
        {loan.prepaymentAllowed && (
          <GradientButton title="Prepay Loan" onPress={() => {}} variant="primary" size="md" />
        )}
        <GradientButton
          title="View Amortization Schedule"
          onPress={() => {}}
          variant="outline"
          size="md"
          style={{ marginTop: spacing[3] }}
        />

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: { paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingBottom: spacing[5] },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    marginBottom: spacing[5],
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statusBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    flexShrink: 0,
  },
  heroBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
  },
  heroLeft: { flex: 1, marginRight: spacing[3] },
  emiChip: {
    marginTop: spacing[3],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  scrollContent: { paddingHorizontal: spacing[5], paddingTop: spacing[5] },

  // Stat grid: explicit rows so each card gets flex: 1 within a row
  statsGrid: { gap: spacing[3], marginBottom: spacing[4] },
  statsRow: { flexDirection: 'row', gap: spacing[3] },
  statCardWrapper: { flex: 1 },
  statCard: { flex: 1 },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
});
