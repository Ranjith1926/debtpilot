import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Switch, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useReminders } from '@hooks/useAnalytics';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { formatCurrency } from '@utils/format';
import { GlassCard, EmptyState } from '@components/ui/index';

export default function RemindersScreen() {
  const { theme, isDark } = useTheme();
  const { data, isLoading } = useReminders();
  const reminders = data?.data ?? [];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient colors={isDark ? ['#0A0A0F', '#0F0F1A'] as const : ['#F0F2FF', '#F8F9FF'] as const} style={StyleSheet.absoluteFill} />

      <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[textVariants.headlineLarge, { color: theme.colors.textPrimary }]}>Reminders</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}>
          <Ionicons name="add" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </MotiView>

      {reminders.length === 0 ? (
        <EmptyState icon="notifications-outline" title="No reminders set" subtitle="Set up reminders so you never miss an EMI payment" actionLabel="Add Reminder" onAction={() => {}} />
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: index * 100 }}>
              <GlassCard style={styles.reminderCard}>
                <View style={styles.reminderHeader}>
                  <View>
                    <Text style={[textVariants.titleLarge, { color: theme.colors.textPrimary }]}>{item.loanName}</Text>
                    <Text style={[textVariants.caption, { color: theme.colors.textSecondary }]}>{item.lenderName}</Text>
                  </View>
                  <Switch value={item.isActive} trackColor={{ true: theme.colors.primary, false: theme.colors.border }} />
                </View>

                <LinearGradient colors={['rgba(124,58,237,0.15)', 'transparent']} style={styles.emiInfo}>
                  <Text style={[textVariants.headlineSmall, { color: theme.colors.textPrimary }]}>
                    {formatCurrency(item.emiAmount)}
                  </Text>
                  <Text style={[textVariants.caption, { color: theme.colors.textSecondary }]}>Due on {item.dueDate}th</Text>
                </LinearGradient>

                <View style={styles.reminderDays}>
                  <Ionicons name="alarm-outline" size={14} color={theme.colors.textSecondary} />
                  <Text style={[textVariants.caption, { color: theme.colors.textSecondary, marginLeft: spacing[1] }]}>
                    Remind: {item.reminderDays.map((d) => `${d} day${d > 1 ? 's' : ''} before`).join(', ')}
                  </Text>
                </View>

                <View style={styles.notifyRow}>
                  {item.notifyVia.map((method) => (
                    <View key={method} style={[styles.notifyBadge, { backgroundColor: theme.colors.surface }]}>
                      <Ionicons name={method === 'push' ? 'phone-portrait' : method === 'sms' ? 'chatbubble' : 'mail'} size={12} color={theme.colors.primary} />
                      <Text style={[textVariants.caption, { color: theme.colors.textSecondary, marginLeft: 4 }]}>{method.toUpperCase()}</Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            </MotiView>
          )}
          ListFooterComponent={<View style={{ height: 40 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[5], paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingBottom: spacing[4] },
  backBtn: { width: 40, height: 40, borderRadius: borderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 40, height: 40, borderRadius: borderRadius.xl, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  list: { paddingHorizontal: spacing[5] },
  reminderCard: { marginBottom: spacing[4] },
  reminderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[3] },
  emiInfo: { padding: spacing[3], borderRadius: borderRadius.lg, marginBottom: spacing[3] },
  reminderDays: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing[3] },
  notifyRow: { flexDirection: 'row', gap: spacing[2] },
  notifyBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[2], paddingVertical: spacing[1], borderRadius: borderRadius.full },
});
