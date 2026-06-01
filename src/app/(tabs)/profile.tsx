import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Platform, Alert, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useAppDispatch } from '@store/hooks';
import { useAuth } from '@hooks/useAuth';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { AnimatedProgressRing, GlassCard } from '@components/ui/index';
import { SUPPORTED_LANGUAGES } from '@localization/i18n';
import { useTranslation } from 'react-i18next';

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 82 : 62;

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { i18n } = useTranslation();
  const bgColors = isDark ? ['#0A0A0F', '#0F0F1A'] as const : ['#F0F2FF', '#F8F9FF'] as const;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { icon: 'person-outline' as const, label: 'Edit Profile', onPress: () => {} },
        { icon: 'shield-checkmark-outline' as const, label: 'KYC Status', badge: user?.kycVerified ? 'Verified' : 'Pending', badgeColor: user?.kycVerified ? theme.colors.success : theme.colors.warning, onPress: () => {} },
        { icon: 'notifications-outline' as const, label: 'Notifications', route: '/notifications' },
        { icon: 'time-outline' as const, label: 'Reminders', route: '/reminders' },
      ],
    },
    {
      title: 'Security',
      items: [
        { icon: 'lock-closed-outline' as const, label: 'Change Password', onPress: () => {} },
        { icon: 'finger-print' as const, label: 'Biometric Login', toggle: true, value: user?.biometricEnabled, onToggle: () => {} },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: 'moon-outline' as const, label: 'Dark Mode', toggle: true, value: isDark, onToggle: toggleTheme },
        { icon: 'language-outline' as const, label: 'Language', subtitle: SUPPORTED_LANGUAGES.find(l => l.code === i18n.language)?.nativeLabel, onPress: () => {} },
        { icon: 'settings-outline' as const, label: 'Settings', route: '/settings' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle-outline' as const, label: 'Help Center', onPress: () => {} },
        { icon: 'chatbubble-outline' as const, label: 'Contact Support', onPress: () => {} },
        { icon: 'star-outline' as const, label: 'Rate the App', onPress: () => {} },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + spacing[4] }}>
        {/* Profile Hero */}
        <LinearGradient colors={isDark ? ['#1A0A2E', '#0A0A1A'] : ['#EDE9FE', '#DBEAFE']} style={styles.hero}>
          <MotiView from={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 100 }} style={styles.avatarContainer}>
            <LinearGradient colors={['#7C3AED', '#06B6D4']} style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) ?? 'U'}</Text>
            </LinearGradient>
            <TouchableOpacity style={[styles.editAvatarBtn, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="camera" size={12} color="#fff" />
            </TouchableOpacity>
          </MotiView>

          <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 200 }}>
            <Text style={[textVariants.headlineMedium, { color: isDark ? '#fff' : theme.colors.textPrimary, textAlign: 'center', marginTop: spacing[3] }]}>
              {user?.name ?? 'User'}
            </Text>
            <Text style={[textVariants.bodySmall, { color: isDark ? 'rgba(255,255,255,0.6)' : theme.colors.textSecondary, textAlign: 'center', marginTop: 2 }]}>
              {user?.email ?? 'user@example.com'}
            </Text>
          </MotiView>

          <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 300 }} style={styles.statsRow}>
            <View style={styles.profileStat}>
              <Text style={[textVariants.headlineSmall, { color: isDark ? '#fff' : theme.colors.textPrimary, fontWeight: '700' }]}>
                {user?.creditScore ?? 748}
              </Text>
              <Text style={[textVariants.caption, { color: isDark ? 'rgba(255,255,255,0.6)' : theme.colors.textSecondary }]}>Credit Score</Text>
            </View>
            <View style={[styles.profileStatDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)' }]} />
            <View style={styles.profileStat}>
              <AnimatedProgressRing
                progress={user?.financialHealthScore ?? 72}
                size={60}
                strokeWidth={5}
                label={`${user?.financialHealthScore ?? 72}`}
                gradientColors={['#7C3AED', '#06B6D4']}
              />
              <Text style={[textVariants.caption, { color: isDark ? 'rgba(255,255,255,0.6)' : theme.colors.textSecondary, marginTop: 2 }]}>
                Health Score
              </Text>
            </View>
            <View style={[styles.profileStatDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)' }]} />
            <View style={styles.profileStat}>
              <Text style={[textVariants.headlineSmall, { color: isDark ? '#fff' : theme.colors.textPrimary, fontWeight: '700' }]}>4</Text>
              <Text style={[textVariants.caption, { color: isDark ? 'rgba(255,255,255,0.6)' : theme.colors.textSecondary }]}>Active Loans</Text>
            </View>
          </MotiView>
        </LinearGradient>

        {/* Settings Groups */}
        <View style={styles.settingsContainer}>
          {settingsGroups.map((group, gi) => (
            <MotiView key={group.title} from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 100 + gi * 80 }}>
              <Text style={[textVariants.labelLarge, { color: theme.colors.textTertiary, marginBottom: spacing[2] }]}>
                {group.title.toUpperCase()}
              </Text>
              <GlassCard noPadding style={styles.settingsCard}>
                {group.items.map((item, ii) => (
                  <TouchableOpacity
                    key={item.label}
                    style={[styles.settingsItem, ii < group.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.divider }]}
                    onPress={item.route ? () => router.push(item.route as any) : item.onPress}
                    disabled={item.toggle}
                  >
                    <View style={[styles.settingsIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
                      <Ionicons name={item.icon} size={18} color={theme.colors.primary} />
                    </View>
                    <View style={styles.settingsInfo}>
                      <Text style={[textVariants.titleMedium, { color: theme.colors.textPrimary }]}>{item.label}</Text>
                      {(item as any).subtitle && (
                        <Text style={[textVariants.caption, { color: theme.colors.textSecondary }]}>{(item as any).subtitle}</Text>
                      )}
                    </View>
                    {item.toggle ? (
                      <Switch value={!!(item as any).value} onValueChange={(item as any).onToggle} trackColor={{ true: theme.colors.primary, false: theme.colors.border }} />
                    ) : (item as any).badge ? (
                      <View style={[styles.badge, { backgroundColor: `${(item as any).badgeColor}20` }]}>
                        <Text style={[textVariants.labelSmall, { color: (item as any).badgeColor }]}>{(item as any).badge}</Text>
                      </View>
                    ) : (
                      <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
                    )}
                  </TouchableOpacity>
                ))}
              </GlassCard>
            </MotiView>
          ))}

          {/* Logout */}
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 600 }}>
            <TouchableOpacity style={[styles.logoutBtn, { borderColor: 'rgba(239,68,68,0.3)' }]} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
              <Text style={[textVariants.titleMedium, { color: theme.colors.error, marginLeft: spacing[2] }]}>Logout</Text>
            </TouchableOpacity>
          </MotiView>

          <Text style={[textVariants.caption, { color: theme.colors.textTertiary, textAlign: 'center', paddingBottom: 100 }]}>
            DebtPilot v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingBottom: spacing[6], alignItems: 'center' },
  avatarContainer: { position: 'relative' },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 36, fontWeight: '900', color: '#fff' },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing[5], paddingHorizontal: spacing[6] },
  profileStat: { flex: 1, alignItems: 'center', gap: 4 },
  profileStatDivider: { width: 1, height: 50 },
  settingsContainer: { paddingHorizontal: spacing[5], paddingTop: spacing[5], gap: spacing[5] },
  settingsCard: { overflow: 'hidden' },
  settingsItem: { flexDirection: 'row', alignItems: 'center', padding: spacing[4] },
  settingsIcon: { width: 36, height: 36, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing[3] },
  settingsInfo: { flex: 1 },
  badge: { paddingHorizontal: spacing[2.5], paddingVertical: spacing[0.5], borderRadius: borderRadius.full },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing[4], borderRadius: borderRadius.xl, borderWidth: 1 },
});
