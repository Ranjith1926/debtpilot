import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius, shadow } from '@theme/spacing';
import { formatCurrency } from '@utils/format';

interface FinancialStatCardProps {
  label: string;
  value: number | string;
  isCurrency?: boolean;
  compact?: boolean;
  trend?: { value: number; isPositive: boolean };
  icon?: keyof typeof Ionicons.glyphMap;
  gradient?: string[];
  animationDelay?: number;
  subtitle?: string;
}

const FinancialStatCard = memo<FinancialStatCardProps>(({
  label, value, isCurrency, compact, trend, icon, gradient, animationDelay = 0, subtitle,
}) => {
  const { theme, isDark } = useTheme();

  const displayValue = isCurrency
    ? formatCurrency(value as number, compact)
    : String(value);

  const iconGradient = (gradient ?? theme.gradients.primary) as [string, string];

  // Light mode: solid white card. Dark mode: translucent glass.
  const cardBg = isDark ? 'rgba(255,255,255,0.07)' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 120, delay: animationDelay }}
      style={[
        styles.card,
        { backgroundColor: cardBg, borderColor: cardBorder, borderWidth: 1 },
        isDark ? shadow.sm : styles.lightShadow,
      ]}
    >
      <View style={styles.header}>
        {icon && (
          <LinearGradient colors={iconGradient} style={styles.iconBg}>
            <Ionicons name={icon} size={16} color="#fff" />
          </LinearGradient>
        )}
        {trend && (
          <View style={[styles.trend, { backgroundColor: trend.isPositive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }]}>
            <Ionicons
              name={trend.isPositive ? 'trending-up' : 'trending-down'}
              size={11}
              color={trend.isPositive ? theme.colors.success : theme.colors.error}
            />
            <Text style={[{ color: trend.isPositive ? theme.colors.success : theme.colors.error, fontSize: 10, marginLeft: 2, fontWeight: '600' }]}>
              {Math.abs(trend.value)}%
            </Text>
          </View>
        )}
      </View>

      <Text
        style={[textVariants.headlineMedium, { color: theme.colors.textPrimary, marginTop: spacing[2], fontWeight: '700' }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.65}
      >
        {displayValue}
      </Text>
      <Text style={[textVariants.labelSmall, { color: theme.colors.textSecondary, marginTop: spacing[1] }]} numberOfLines={1}>
        {label}
      </Text>
      {subtitle && (
        <Text style={[textVariants.caption, { color: theme.colors.textTertiary, marginTop: 2 }]} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </MotiView>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBg: { width: 34, height: 34, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  trend: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[1.5], paddingVertical: 3, borderRadius: borderRadius.full },
  lightShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});

FinancialStatCard.displayName = 'FinancialStatCard';
export default FinancialStatCard;
