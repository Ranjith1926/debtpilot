import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import GradientButton from './GradientButton';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = memo<EmptyStateProps>(({ icon = 'folder-open-outline', title, subtitle, actionLabel, onAction }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <MotiView
        from={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 100 }}
      >
        <LinearGradient
          colors={theme.gradients.card as [string, string]}
          style={styles.iconBg}
        >
          <Ionicons name={icon} size={48} color={theme.colors.textTertiary} />
        </LinearGradient>
      </MotiView>
      <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 200 }}>
        <Text style={[textVariants.headlineSmall, { color: theme.colors.textPrimary, textAlign: 'center', marginTop: spacing[5] }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[textVariants.bodyMedium, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: spacing[2] }]}>
            {subtitle}
          </Text>
        )}
        {actionLabel && onAction && (
          <View style={styles.actionContainer}>
            <GradientButton title={actionLabel} onPress={onAction} fullWidth={false} style={styles.actionBtn} />
          </View>
        )}
      </MotiView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing[8] },
  iconBg: { width: 100, height: 100, borderRadius: borderRadius['2xl'], alignItems: 'center', justifyContent: 'center' },
  actionContainer: { marginTop: spacing[6], alignItems: 'center' },
  actionBtn: { paddingHorizontal: spacing[8] },
});

EmptyState.displayName = 'EmptyState';
export default EmptyState;
