import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform,
  Dimensions, Modal, TextInput, FlatList, Alert, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useQueryClient } from '@tanstack/react-query';
import { useLoanDetail } from '@hooks/useLoans';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { formatCurrency, formatDate } from '@utils/format';
import { getLoanTypeColor } from '@utils/loan.utils';
import { GlassCard, AnimatedProgressRing, GradientButton } from '@components/ui/index';
import { LOAN_TYPE_LABELS, QUERY_KEYS } from '@constants/app.constants';
import { apiClient } from '@api/axios.client';
import { ENDPOINTS } from '@constants/endpoints';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function buildAmortization(principal: number, annualRate: number, months: number, startDate: string) {
  const r = annualRate / 12 / 100;
  const emi = r === 0
    ? Math.round(principal / months)
    : Math.round((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));

  const rows: { month: number; date: string; emi: number; principal: number; interest: number; balance: number }[] = [];
  let balance = principal;

  for (let i = 1; i <= months; i++) {
    const interest = Math.round(balance * r);
    const principalPaid = Math.min(emi - interest, balance);
    balance = Math.max(0, balance - principalPaid);

    const d = new Date(startDate);
    d.setMonth(d.getMonth() + i);
    rows.push({
      month: i,
      date: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      emi,
      principal: principalPaid,
      interest,
      balance,
    });
  }
  return rows;
}

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDark } = useTheme();
  const { data: loan, isLoading } = useLoanDetail(id ?? '');
  const queryClient = useQueryClient();

  const [showAmort, setShowAmort] = useState(false);
  const [showPrepay, setShowPrepay] = useState(false);
  const [prepayAmount, setPrepayAmount] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  const amortSchedule = useMemo(() => {
    if (!loan) return [];
    return buildAmortization(loan.principalAmount, loan.interestRate, loan.tenureMonths, loan.startDate);
  }, [loan]);

  const handlePrepay = async () => {
    const amount = parseFloat(prepayAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid prepayment amount.');
      return;
    }
    if (amount > (loan?.outstandingAmount ?? 0)) {
      Alert.alert('Invalid Amount', 'Amount cannot exceed outstanding balance.');
      return;
    }
    setIsPaying(true);
    try {
      await apiClient.post(ENDPOINTS.EMIS.PAY, {
        loanId: loan!.id,
        amount,
        paymentDate: new Date().toISOString(),
        method: 'UPI',
      });
      setShowPrepay(false);
      setPrepayAmount('');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOANS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOAN_DETAIL(id ?? '') });
      Alert.alert('Payment Successful', `₹${amount.toLocaleString('en-IN')} prepayment recorded.`);
    } catch {
      Alert.alert('Payment Failed', 'Could not process payment. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading || !loan) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <LinearGradient colors={isDark ? ['#0A0A0F', '#0F0F1A'] : ['#F0F2FF', '#F8F9FF']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator color={theme.colors.primary} size="large" />
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
    { label: 'Account No.', value: loan.accountNumber || '—' },
    { label: 'EMI Due Date', value: `${loan.emiDueDate}th every month` },
    { label: 'Last Payment', value: loan.lastPaymentDate ? formatDate(loan.lastPaymentDate) : 'N/A' },
  ];

  const bgColors = isDark ? ['#0A0A0F', '#0F0F1A'] as const : ['#F0F2FF', '#F8F9FF'] as const;
  const ringSize = Math.min(110, SCREEN_WIDTH * 0.27);
  const modalBg = isDark ? '#0F0F1A' : '#F8F9FF';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} />

      {/* Hero header */}
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

        <View style={styles.heroBody}>
          <View style={styles.heroLeft}>
            <Text style={[textVariants.labelMedium, { color: theme.colors.textSecondary }]}>
              {LOAN_TYPE_LABELS[loan.type]}
            </Text>
            <Text
              style={[textVariants.amountLarge, { color: theme.colors.textPrimary, marginTop: spacing[1], fontSize: Math.min(36, SCREEN_WIDTH * 0.09) }]}
              adjustsFontSizeToFit numberOfLines={1}
            >
              {formatCurrency(loan.outstandingAmount, true)}
            </Text>
            <Text style={[textVariants.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>Outstanding Balance</Text>
            <View style={[styles.emiChip, { backgroundColor: `${typeColor}20`, borderColor: `${typeColor}40`, borderWidth: 1 }]}>
              <Text style={[textVariants.labelMedium, { color: typeColor }]}>EMI: {formatCurrency(loan.emiAmount)}/mo</Text>
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
        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          {[quickStats.slice(0, 2), quickStats.slice(2, 4)].map((row, ri) => (
            <View key={ri} style={styles.statsRow}>
              {row.map((stat, i) => (
                <MotiView key={stat.label} from={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: (ri * 2 + i) * 80 }} style={styles.statCardWrapper}>
                  <GlassCard style={styles.statCard}>
                    <Ionicons name={stat.icon} size={20} color={stat.color} />
                    <Text style={[textVariants.headlineSmall, { color: theme.colors.textPrimary, marginTop: spacing[1.5], fontWeight: '700' }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                      {stat.value}
                    </Text>
                    <Text style={[textVariants.caption, { color: theme.colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>{stat.label}</Text>
                  </GlassCard>
                </MotiView>
              ))}
            </View>
          ))}
        </View>

        {/* Loan Details */}
        <GlassCard style={{ marginBottom: spacing[4] }}>
          <Text style={[textVariants.headlineSmall, { color: theme.colors.textPrimary, marginBottom: spacing[3] }]}>Loan Details</Text>
          {details.map((d, i) => (
            <View key={d.label} style={[styles.detailRow, i < details.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.divider }]}>
              <Text style={[textVariants.bodyMedium, { color: theme.colors.textSecondary, flex: 1 }]}>{d.label}</Text>
              <Text style={[textVariants.titleMedium, { color: theme.colors.textPrimary, flex: 1, textAlign: 'right' }]} numberOfLines={1} adjustsFontSizeToFit>{d.value}</Text>
            </View>
          ))}
        </GlassCard>

        {/* Actions */}
        {loan.prepaymentAllowed && (
          <GradientButton title="Prepay Loan" onPress={() => setShowPrepay(true)} variant="primary" size="md" />
        )}
        <GradientButton
          title="View Amortization Schedule"
          onPress={() => setShowAmort(true)}
          variant="outline"
          size="md"
          style={{ marginTop: spacing[3] }}
        />
        <View style={{ height: 48 }} />
      </ScrollView>

      {/* ── Prepay Modal ───────────────────────────────────────────── */}
      <Modal visible={showPrepay} animationType="slide" transparent onRequestClose={() => setShowPrepay(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: modalBg }]}>
            <View style={styles.modalHandle} />
            <Text style={[textVariants.headlineSmall, { color: theme.colors.textPrimary, marginBottom: spacing[1] }]}>Prepay Loan</Text>
            <Text style={[textVariants.bodySmall, { color: theme.colors.textSecondary, marginBottom: spacing[5] }]}>
              Outstanding: {formatCurrency(loan.outstandingAmount)}
            </Text>

            <Text style={[textVariants.labelMedium, { color: theme.colors.textSecondary, marginBottom: spacing[2] }]}>PREPAYMENT AMOUNT (₹)</Text>
            <View style={[styles.inputRow, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <Text style={[textVariants.titleLarge, { color: theme.colors.textTertiary, marginRight: spacing[2] }]}>₹</Text>
              <TextInput
                style={[textVariants.headlineSmall, { color: theme.colors.textPrimary, flex: 1 }]}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={theme.colors.textTertiary}
                value={prepayAmount}
                onChangeText={setPrepayAmount}
                autoFocus
              />
            </View>

            <View style={styles.quickAmounts}>
              {[10000, 25000, 50000].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.quickAmt, { borderColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}12` }]}
                  onPress={() => setPrepayAmount(String(amt))}
                >
                  <Text style={[textVariants.labelMedium, { color: theme.colors.primary }]}>+{(amt / 1000).toFixed(0)}K</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.quickAmt, { borderColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}12` }]}
                onPress={() => setPrepayAmount(String(Math.round(loan.outstandingAmount)))}
              >
                <Text style={[textVariants.labelMedium, { color: theme.colors.primary }]}>Full</Text>
              </TouchableOpacity>
            </View>

            <GradientButton
              title={isPaying ? 'Processing…' : 'Confirm Payment'}
              onPress={handlePrepay}
              isLoading={isPaying}
              style={{ marginTop: spacing[4] }}
            />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowPrepay(false); setPrepayAmount(''); }}>
              <Text style={[textVariants.labelMedium, { color: theme.colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Amortization Modal ─────────────────────────────────────── */}
      <Modal visible={showAmort} animationType="slide" transparent onRequestClose={() => setShowAmort(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.amortSheet, { backgroundColor: modalBg }]}>
            <View style={styles.modalHandle} />
            <View style={styles.amortHeader}>
              <Text style={[textVariants.headlineSmall, { color: theme.colors.textPrimary }]}>Amortization Schedule</Text>
              <TouchableOpacity onPress={() => setShowAmort(false)}>
                <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Table header */}
            <View style={[styles.tableHeader, { backgroundColor: `${typeColor}15` }]}>
              {['#', 'Date', 'EMI', 'Principal', 'Interest', 'Balance'].map((h) => (
                <Text key={h} style={[textVariants.labelSmall, { color: typeColor, flex: h === 'Balance' || h === 'EMI' ? 1.3 : h === '#' ? 0.5 : 1, textAlign: h === '#' ? 'center' : 'right', fontSize: 10 }]}>
                  {h}
                </Text>
              ))}
            </View>

            <FlatList
              data={amortSchedule}
              keyExtractor={(item) => String(item.month)}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <View style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? 'transparent' : `${theme.colors.surface}` }]}>
                  <Text style={[styles.cell, { flex: 0.5, textAlign: 'center', color: theme.colors.textTertiary }]}>{item.month}</Text>
                  <Text style={[styles.cell, { flex: 1, color: theme.colors.textSecondary }]}>{item.date}</Text>
                  <Text style={[styles.cell, { flex: 1.3, color: theme.colors.textPrimary }]}>₹{(item.emi / 1000).toFixed(1)}K</Text>
                  <Text style={[styles.cell, { flex: 1, color: theme.colors.success }]}>₹{(item.principal / 1000).toFixed(1)}K</Text>
                  <Text style={[styles.cell, { flex: 1, color: theme.colors.error }]}>₹{(item.interest / 1000).toFixed(1)}K</Text>
                  <Text style={[styles.cell, { flex: 1.3, color: theme.colors.textPrimary, fontWeight: '600' }]}>₹{(item.balance / 1000).toFixed(1)}K</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: { paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingBottom: spacing[5] },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[5], marginBottom: spacing[5] },
  backBtn: { width: 40, height: 40, borderRadius: borderRadius.xl, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statusBadge: { paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: borderRadius.full, flexShrink: 0 },
  heroBody: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[5] },
  heroLeft: { flex: 1, marginRight: spacing[3] },
  emiChip: { marginTop: spacing[3], paddingHorizontal: spacing[3], paddingVertical: spacing[1.5], borderRadius: borderRadius.full, alignSelf: 'flex-start' },
  scrollContent: { paddingHorizontal: spacing[5], paddingTop: spacing[5] },
  statsGrid: { gap: spacing[3], marginBottom: spacing[4] },
  statsRow: { flexDirection: 'row', gap: spacing[3] },
  statCardWrapper: { flex: 1 },
  statCard: { flex: 1 },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[3] },

  // Modals
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: spacing[6], paddingBottom: Platform.OS === 'ios' ? 40 : spacing[6] },
  amortSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: spacing[5], paddingBottom: 0, height: '82%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(128,128,128,0.35)', alignSelf: 'center', marginBottom: spacing[4] },
  amortHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] },

  // Prepay
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: borderRadius.xl, paddingHorizontal: spacing[4], paddingVertical: spacing[3], marginBottom: spacing[4] },
  quickAmounts: { flexDirection: 'row', gap: spacing[2] },
  quickAmt: { flex: 1, alignItems: 'center', paddingVertical: spacing[2], borderRadius: borderRadius.lg, borderWidth: 1 },
  cancelBtn: { alignItems: 'center', paddingVertical: spacing[4] },

  // Amortization table
  tableHeader: { flexDirection: 'row', paddingVertical: spacing[2], paddingHorizontal: spacing[3], borderRadius: borderRadius.md, marginBottom: spacing[1] },
  tableRow: { flexDirection: 'row', paddingVertical: spacing[2.5], paddingHorizontal: spacing[3], borderRadius: borderRadius.sm },
  cell: { fontSize: 11, textAlign: 'right' },
});
