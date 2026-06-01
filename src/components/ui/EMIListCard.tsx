import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { formatCurrency, formatDateShort, daysUntil } from '@utils/format';
import { getLoanTypeColor } from '@utils/loan.utils';
import { EMI } from '@/types/loan.types';
import { LOAN_TYPE_ICONS } from '@constants/app.constants';

interface EMIListCardProps {
  emi: EMI;
  onPress?: (emi: EMI) => void;
  onPayPress?: (emi: EMI) => void;
  index?: number;
}

const statusConfig = {
  paid: { label: 'Paid', bg: 'rgba(16,185,129,0.15)', color: '#10B981' },
  overdue: { label: 'Overdue', bg: 'rgba(239,68,68,0.15)', color: '#EF4444' },
  pending: { label: 'Due Today', bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
  upcoming: { label: 'Upcoming', bg: 'rgba(6,182,212,0.15)', color: '#06B6D4' },
};

const EMIListCard = memo<EMIListCardProps>(({ emi, onPress, onPayPress, index = 0 }) => {
  const { theme } = useTheme();
  const daysLeft = daysUntil(emi.dueDate);
  const typeColor = getLoanTypeColor(emi.loanType);
  const status = statusConfig[emi.status];
  const icon = LOAN_TYPE_ICONS[emi.loanType] as keyof typeof Ionicons.glyphMap ?? 'card';

  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 120, delay: index * 80 }}
    >
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder, borderWidth: 1 }]}
        onPress={() => onPress?.(emi)}
        activeOpacity={0.8}
      >
        <View style={[styles.typeBar, { backgroundColor: typeColor }]} />
        <LinearGradient
          colors={[`${typeColor}15`, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.content}>
          <View style={styles.left}>
            <View style={[styles.iconContainer, { backgroundColor: `${typeColor}20` }]}>
              <Ionicons name={icon} size={20} color={typeColor} />
            </View>
            <View style={styles.info}>
              <Text style={[textVariants.titleMedium, { color: theme.colors.textPrimary }]}>
                {emi.lenderName}
              </Text>
              <Text style={[textVariants.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                {emi.loanName} • #{emi.installmentNumber}/{emi.totalInstallments}
              </Text>
              <View style={styles.row}>
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                  <Text style={[textVariants.labelSmall, { color: status.color }]}>{status.label}</Text>
                </View>
                {emi.status !== 'paid' && Math.abs(daysLeft) <= 365 && (
                  <Text style={[textVariants.caption, { color: daysLeft < 0 ? theme.colors.error : theme.colors.textTertiary, marginLeft: spacing[2] }]}>
                    {daysLeft > 0 ? `in ${daysLeft}d` : daysLeft === 0 ? 'Today' : `${Math.abs(daysLeft)}d late`}
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View style={styles.right}>
            <Text style={[textVariants.titleLarge, { color: theme.colors.textPrimary, fontWeight: '700' }]}>
              {formatCurrency(emi.amount)}
            </Text>
            <Text style={[textVariants.caption, { color: theme.colors.textSecondary, textAlign: 'right', marginTop: 2 }]}>
              {formatDateShort(emi.dueDate)}
            </Text>
            {emi.status !== 'paid' && onPayPress && (
              <TouchableOpacity
                style={[styles.payBtn, { borderColor: typeColor }]}
                onPress={() => onPayPress(emi)}
                activeOpacity={0.8}
              >
                <Text style={[textVariants.labelSmall, { color: typeColor }]}>Pay</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {emi.penaltyAmount > 0 && (
          <View style={styles.penalty}>
            <Ionicons name="warning" size={12} color={theme.colors.error} />
            <Text style={[textVariants.caption, { color: theme.colors.error, marginLeft: 4 }]}>
              Penalty: {formatCurrency(emi.penaltyAmount)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </MotiView>
  );
});

const styles = StyleSheet.create({
  card: { borderRadius: borderRadius.xl, marginBottom: spacing[3], borderWidth: 1, overflow: 'hidden' },
  typeBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing[4], paddingLeft: spacing[5] },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { width: 44, height: 44, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing[3] },
  info: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: spacing[1] },
  statusBadge: { paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: borderRadius.full },
  right: { alignItems: 'flex-end', marginLeft: spacing[2] },
  payBtn: { marginTop: spacing[1.5], paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: borderRadius.full, borderWidth: 1 },
  penalty: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[5], paddingBottom: spacing[3] },
});

EMIListCard.displayName = 'EMIListCard';
export default EMIListCard;
