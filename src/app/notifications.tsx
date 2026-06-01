import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useNotifications } from '@hooks/useNotifications';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { GlassCard } from '@components/ui/index';
import { Notification, NotificationType } from '@/types/notification.types';

const typeConfig: Record<NotificationType, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  due_soon: { icon: 'alarm', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  overdue: { icon: 'warning', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  payment_success: { icon: 'checkmark-circle', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  payment_failed: { icon: 'close-circle', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  insight: { icon: 'bulb', color: '#7C3AED', bg: 'rgba(124,58,237,0.12)' },
  system: { icon: 'information-circle', color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' },
};

const getTimeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 6) return `${Math.floor(days / 7)}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${mins}m ago`;
};

const NotificationItem = ({ item, index, onPress }: { item: Notification; index: number; onPress: (id: string) => void }) => {
  const { theme } = useTheme();
  const config = typeConfig[item.type] ?? typeConfig.system;

  return (
    <MotiView from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: index * 60 }}>
      <TouchableOpacity onPress={() => onPress(item.id)} activeOpacity={0.8}>
        <GlassCard style={[styles.card, !item.isRead && { borderLeftWidth: 3, borderLeftColor: config.color }]}>
          <View style={styles.content}>
            <View style={[styles.iconBg, { backgroundColor: config.bg }]}>
              <Ionicons name={config.icon} size={20} color={config.color} />
            </View>
            <View style={styles.textContent}>
              <View style={styles.titleRow}>
                <Text style={[textVariants.titleMedium, { color: theme.colors.textPrimary, flex: 1 }]}>{item.title}</Text>
                {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: config.color }]} />}
              </View>
              <Text style={[textVariants.bodySmall, { color: theme.colors.textSecondary, marginTop: 2 }]} numberOfLines={2}>
                {item.body}
              </Text>
              <Text style={[textVariants.caption, { color: theme.colors.textTertiary, marginTop: spacing[1] }]}>
                {getTimeAgo(item.createdAt)}
              </Text>
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </MotiView>
  );
};

export default function NotificationsScreen() {
  const { theme, isDark } = useTheme();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#0A0A0F', '#0F0F1A'] as const : ['#F0F2FF', '#F8F9FF'] as const}
        style={StyleSheet.absoluteFill}
      />

      <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[textVariants.headlineLarge, { color: theme.colors.textPrimary }]}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={[textVariants.caption, { color: theme.colors.primary }]}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={() => markAllRead()}>
            <Text style={[textVariants.labelMedium, { color: theme.colors.primary }]}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </MotiView>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <NotificationItem item={item} index={index} onPress={markRead} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={theme.colors.textTertiary} />
            <Text style={[textVariants.titleMedium, { color: theme.colors.textSecondary, marginTop: spacing[3] }]}>
              No notifications yet
            </Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 40 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    paddingHorizontal: spacing[5], paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingBottom: spacing[4],
  },
  backBtn: { width: 40, height: 40, borderRadius: borderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: spacing[5] },
  card: { marginBottom: spacing[3], overflow: 'hidden' },
  content: { flexDirection: 'row', alignItems: 'flex-start' },
  iconBg: { width: 44, height: 44, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing[3], flexShrink: 0 },
  textContent: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginLeft: spacing[2] },
  empty: { alignItems: 'center', paddingTop: 80 },
});
