import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius, shadow } from '@theme/spacing';
import { formatCurrency, formatDateShort } from '@utils/format';
import { getLoanTypeColor } from '@utils/loan.utils';
import { Loan } from '@/types/loan.types';
import { LOAN_TYPE_LABELS, LOAN_TYPE_ICONS } from '@constants/app.constants';

interface LoanSummaryCardProps {
  loan: Loan;
  onPress?: (loan: Loan) => void;
  index?: number;
}

const LoanSummaryCard = memo<LoanSummaryCardProps>(({ loan, onPress, index = 0 }) => {
  const { theme, isDark } = useTheme();
  const typeColor = getLoanTypeColor(loan.type);
  const progress = ((loan.principalAmount - loan.outstandingAmount) / loan.principalAmount) * 100;
  const icon = (LOAN_TYPE_ICONS[loan.type] ?? 'card') as keyof typeof Ionicons.glyphMap;

  const cardBg = isDark ? theme.colors.backgroundSecondary : '#fff';
  const cardBorder = isDark ? `${typeColor}30` : `${typeColor}25`;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 120, delay: index * 100 }}
    >
      <TouchableOpacity
        onPress={() => onPress?.(loan)}
        activeOpacity={0.85}
        style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder, borderWidth: 1.5 }, shadow.md]}
      >
        {/* Left color accent bar */}
        <View style={[styles.accentBar, { backgroundColor: typeColor }]} />

        {/* Subtle gradient tint */}
        <LinearGradient
          colors={[`${typeColor}18`, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: borderRadius['2xl'] }]}
          pointerEvents="none"
        />

        <View style={styles.inner}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconBg, { backgroundColor: `${typeColor}22` }]}>
              <Ionicons name={icon} size={22} color={typeColor} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={[textVariants.titleLarge, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {loan.lenderName}
              </Text>
              <Text style={[textVariants.caption, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {LOAN_TYPE_LABELS[loan.type]} • {loan.accountNumber}
              </Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: loan.status === 'active' ? theme.colors.success : theme.colors.error }]} />
          </View>

          {/* Amounts */}
          <View style={styles.amounts}>
            <View style={styles.amountBlock}>
              <Text style={[textVariants.caption, { color: theme.colors.textSecondary }]}>Outstanding</Text>
              <Text style={[textVariants.headlineSmall, { color: theme.colors.textPrimary, fontWeight: '700' }]}>
                {formatCurrency(loan.outstandingAmount, true)}
              </Text>
            </View>
            <View style={[styles.amountDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.amountBlock}>
              <Text style={[textVariants.caption, { color: theme.colors.textSecondary }]}>EMI / Month</Text>
              <Text style={[textVariants.headlineSmall, { color: typeColor, fontWeight: '700' }]}>
                {formatCurrency(loan.emiAmount)}
              </Text>
            </View>
          </View>

          {/* Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[textVariants.caption, { color: theme.colors.textSecondary }]}>Repayment Progress</Text>
              <Text style={[textVariants.labelSmall, { color: typeColor }]}>{progress.toFixed(1)}%</Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
              <LinearGradient
                colors={[typeColor, `${typeColor}70`]}
                style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerItem}>
              <Ionicons name="calendar-outline" size={12} color={theme.colors.textTertiary} />
              <Text style={[textVariants.caption, { color: theme.colors.textSecondary, marginLeft: 4 }]}>
                Next: {formatDateShort(loan.nextEMIDate)}
              </Text>
            </View>
            <View style={styles.footerItem}>
              <Ionicons name="trending-down-outline" size={12} color={theme.colors.textTertiary} />
              <Text style={[textVariants.caption, { color: theme.colors.textSecondary, marginLeft: 4 }]}>
                Rate: {loan.interestRate}% p.a.
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius['2xl'],
    marginBottom: spacing[4],
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  inner: { padding: spacing[5], paddingLeft: spacing[5] + 4 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing[4] },
  iconBg: { width: 46, height: 46, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center', marginRight: spacing[3] },
  headerInfo: { flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  amounts: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing[4] },
  amountBlock: { flex: 1 },
  amountDivider: { width: 1, height: 36, marginHorizontal: spacing[4] },
  progressSection: { marginBottom: spacing[3] },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[1.5] },
  progressTrack: { height: 6, borderRadius: borderRadius.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: borderRadius.full },
  footer: { flexDirection: 'row', justifyContent: 'space-between' },
  footerItem: { flexDirection: 'row', alignItems: 'center' },
});

LoanSummaryCard.displayName = 'LoanSummaryCard';
export default LoanSummaryCard;
