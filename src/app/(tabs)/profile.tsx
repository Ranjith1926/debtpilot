import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch,
  Platform, Alert, Modal, TextInput, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useAppDispatch } from '@store/hooks';
import { useAuth } from '@hooks/useAuth';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { AnimatedProgressRing, GlassCard, GradientButton } from '@components/ui/index';
import { SUPPORTED_LANGUAGES } from '@localization/i18n';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@api/axios.client';
import { ENDPOINTS } from '@constants/endpoints';
import { setUser } from '@store/slices/auth.slice';
import { BiometricService } from '@services/biometric.service';
import { StorageService } from '@services/storage.service';
import { STORAGE_KEYS } from '@constants/app.constants';

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 82 : 62;

const KYC_STEPS = [
  { icon: 'person-outline' as const, label: 'Aadhaar Verification', done: false },
  { icon: 'card-outline' as const, label: 'PAN Card Verification', done: false },
  { icon: 'home-outline' as const, label: 'Address Proof', done: false },
  { icon: 'camera-outline' as const, label: 'Selfie / Face Match', done: false },
];

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();
  const { i18n, t } = useTranslation();

  // Edit profile state
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? '');
  const [editPhone, setEditPhone] = useState(user?.phone ?? '');
  const [editIncome, setEditIncome] = useState(
    user?.monthlyIncome ? String(user.monthlyIncome) : '',
  );
  const [isSaving, setIsSaving] = useState(false);

  // KYC & Credit Score modals
  const [showKYC, setShowKYC] = useState(false);
  const [showCredit, setShowCredit] = useState(false);

  // Biometric
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  useEffect(() => {
    StorageService.get<boolean>(STORAGE_KEYS.BIOMETRIC_ENABLED).then((v) => setBiometricEnabled(!!v));
  }, []);

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled) {
      const available = await BiometricService.isAvailable();
      if (!available) {
        Alert.alert('Not Available', 'Biometric authentication is not set up on this device. Please enroll fingerprint or face in device settings.');
        return;
      }
      const result = await BiometricService.authenticate('Enable biometric login for DebtPilot');
      if (!result.success) return;
      await StorageService.set(STORAGE_KEYS.BIOMETRIC_ENABLED, true);
      setBiometricEnabled(true);
      Alert.alert('Enabled', 'Biometric login is now active.');
    } else {
      await StorageService.remove(STORAGE_KEYS.BIOMETRIC_ENABLED);
      setBiometricEnabled(false);
    }
  };

  const bgColors = isDark ? ['#0A0A0F', '#0F0F1A'] as const : ['#F0F2FF', '#F8F9FF'] as const;
  const modalBg = isDark ? '#0F0F1A' : '#F8F9FF';
  const creditScore = user?.creditScore ?? 748;
  const healthScore = user?.financialHealthScore ?? 72;

  const openEdit = () => {
    setEditName(user?.name ?? '');
    setEditPhone(user?.phone ?? '');
    setEditIncome(user?.monthlyIncome ? String(user.monthlyIncome) : '');
    setShowEdit(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) { Alert.alert('Error', 'Name cannot be empty'); return; }
    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = { name: editName.trim() };
      if (editPhone.trim()) payload.phone = editPhone.trim();
      if (editIncome.trim()) payload.monthlyIncome = parseFloat(editIncome);

      const res = await apiClient.put(ENDPOINTS.USER.ME, payload);
      dispatch(setUser({ ...user!, ...res.data.data }));
      setShowEdit(false);
      Alert.alert('Saved', 'Profile updated successfully.');
    } catch {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  const creditColor =
    creditScore >= 750 ? '#10B981' : creditScore >= 650 ? '#F59E0B' : '#EF4444';
  const creditLabel =
    creditScore >= 750 ? 'Excellent' : creditScore >= 700 ? 'Good' : creditScore >= 650 ? 'Fair' : 'Poor';

  const settingsGroups = [
    {
      title: t('settings.account'),
      items: [
        { icon: 'person-outline' as const, label: t('profile.editProfile'), onPress: openEdit },
        {
          icon: 'shield-checkmark-outline' as const,
          label: t('profile.kycStatus'),
          badge: user?.kycVerified ? t('profile.verified') : t('profile.pending'),
          badgeColor: user?.kycVerified ? theme.colors.success : theme.colors.warning,
          onPress: () => setShowKYC(true),
        },
        { icon: 'notifications-outline' as const, label: t('profile.notifications'), route: '/notifications' },
        { icon: 'time-outline' as const, label: t('reminders.title'), route: '/reminders' },
      ],
    },
    {
      title: t('settings.security'),
      items: [
        { icon: 'lock-closed-outline' as const, label: t('settings.changePassword'), route: '/settings', onPress: undefined },
        { icon: 'finger-print' as const, label: t('profile.biometric'), toggle: true, value: biometricEnabled, onToggle: handleBiometricToggle },
      ],
    },
    {
      title: t('settings.preferences'),
      items: [
        { icon: 'moon-outline' as const, label: t('profile.darkMode'), toggle: true, value: isDark, onToggle: toggleTheme },
        { icon: 'language-outline' as const, label: t('profile.language'), subtitle: SUPPORTED_LANGUAGES.find(l => l.code === i18n.language)?.nativeLabel, route: '/settings', onPress: undefined },
        { icon: 'settings-outline' as const, label: t('profile.settings'), route: '/settings', onPress: undefined },
      ],
    },
    {
      title: t('settings.support'),
      items: [
        { icon: 'help-circle-outline' as const, label: t('settings.helpCenter'), onPress: () => {} },
        { icon: 'chatbubble-outline' as const, label: t('settings.contactSupport'), onPress: () => {} },
        { icon: 'star-outline' as const, label: t('settings.rateApp'), onPress: () => {} },
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
              <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() ?? 'U'}</Text>
            </LinearGradient>
            <TouchableOpacity style={[styles.editAvatarBtn, { backgroundColor: theme.colors.primary }]} onPress={openEdit}>
              <Ionicons name="camera" size={12} color="#fff" />
            </TouchableOpacity>
          </MotiView>

          <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 200 }}>
            <Text style={[textVariants.headlineMedium, { color: isDark ? '#fff' : theme.colors.textPrimary, textAlign: 'center', marginTop: spacing[3] }]}>
              {user?.name ?? 'User'}
            </Text>
            <Text style={[textVariants.bodySmall, { color: isDark ? 'rgba(255,255,255,0.6)' : theme.colors.textSecondary, textAlign: 'center', marginTop: 2 }]}>
              {user?.email ?? ''}
            </Text>
          </MotiView>

          <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 300 }} style={styles.statsRow}>
            {/* Credit Score — tappable */}
            <TouchableOpacity style={styles.profileStat} onPress={() => setShowCredit(true)} activeOpacity={0.75}>
              <Text style={[textVariants.headlineSmall, { color: creditColor, fontWeight: '700' }]}>{creditScore}</Text>
              <Text style={[textVariants.caption, { color: isDark ? 'rgba(255,255,255,0.6)' : theme.colors.textSecondary }]}>Credit Score</Text>
              <Ionicons name="chevron-forward" size={12} color={creditColor} style={{ marginTop: 2 }} />
            </TouchableOpacity>

            <View style={[styles.profileStatDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)' }]} />

            <View style={styles.profileStat}>
              <AnimatedProgressRing
                progress={healthScore}
                size={60}
                strokeWidth={5}
                label={`${healthScore}`}
                gradientColors={['#7C3AED', '#06B6D4']}
              />
              <Text style={[textVariants.caption, { color: isDark ? 'rgba(255,255,255,0.6)' : theme.colors.textSecondary, marginTop: 2 }]}>
                Health Score
              </Text>
            </View>

            <View style={[styles.profileStatDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)' }]} />

            <View style={styles.profileStat}>
              <Text style={[textVariants.headlineSmall, { color: isDark ? '#fff' : theme.colors.textPrimary, fontWeight: '700' }]}>
                {user?.monthlyIncome ? `₹${Math.round((user.monthlyIncome as number) / 1000)}K` : '—'}
              </Text>
              <Text style={[textVariants.caption, { color: isDark ? 'rgba(255,255,255,0.6)' : theme.colors.textSecondary }]}>Monthly Income</Text>
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
                    onPress={(item as any).route ? () => router.push((item as any).route) : (item as any).onPress}
                    disabled={(item as any).toggle}
                    activeOpacity={0.7}
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
                    {(item as any).toggle ? (
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

          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 600 }}>
            <TouchableOpacity style={[styles.logoutBtn, { borderColor: 'rgba(239,68,68,0.3)' }]} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
              <Text style={[textVariants.titleMedium, { color: theme.colors.error, marginLeft: spacing[2] }]}>{t('profile.logout')}</Text>
            </TouchableOpacity>
          </MotiView>

          <Text style={[textVariants.caption, { color: theme.colors.textTertiary, textAlign: 'center', paddingBottom: 100 }]}>
            DebtPilot v1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* ── Edit Profile Modal ────────────────────────────────────── */}
      <Modal visible={showEdit} animationType="slide" transparent onRequestClose={() => setShowEdit(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: modalBg }]}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={[textVariants.headlineSmall, { color: theme.colors.textPrimary }]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEdit(false)}>
                <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>FULL NAME</Text>
            <View style={[styles.inputBox, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <Ionicons name="person-outline" size={18} color={theme.colors.textTertiary} style={{ marginRight: spacing[2] }} />
              <TextInput
                style={[textVariants.titleMedium, { color: theme.colors.textPrimary, flex: 1 }]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Your full name"
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>

            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>PHONE NUMBER</Text>
            <View style={[styles.inputBox, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <Ionicons name="call-outline" size={18} color={theme.colors.textTertiary} style={{ marginRight: spacing[2] }} />
              <TextInput
                style={[textVariants.titleMedium, { color: theme.colors.textPrimary, flex: 1 }]}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="+91 XXXXX XXXXX"
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="phone-pad"
              />
            </View>

            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>MONTHLY INCOME (₹)</Text>
            <View style={[styles.inputBox, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <Ionicons name="cash-outline" size={18} color={theme.colors.textTertiary} style={{ marginRight: spacing[2] }} />
              <TextInput
                style={[textVariants.titleMedium, { color: theme.colors.textPrimary, flex: 1 }]}
                value={editIncome}
                onChangeText={setEditIncome}
                placeholder="e.g. 50000"
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.emailRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Ionicons name="mail-outline" size={16} color={theme.colors.textTertiary} />
              <Text style={[textVariants.bodySmall, { color: theme.colors.textTertiary, marginLeft: spacing[2] }]}>
                {user?.email}  ·  Email cannot be changed
              </Text>
            </View>

            <GradientButton
              title={isSaving ? 'Saving…' : 'Save Changes'}
              onPress={handleSaveProfile}
              isLoading={isSaving}
              style={{ marginTop: spacing[4] }}
            />
          </View>
        </View>
      </Modal>

      {/* ── KYC Status Modal ─────────────────────────────────────── */}
      <Modal visible={showKYC} animationType="slide" transparent onRequestClose={() => setShowKYC(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: modalBg }]}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={[textVariants.headlineSmall, { color: theme.colors.textPrimary }]}>KYC Verification</Text>
              <TouchableOpacity onPress={() => setShowKYC(false)}>
                <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Status banner */}
            <View style={[styles.kycBanner, { backgroundColor: user?.kycVerified ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', borderColor: user?.kycVerified ? theme.colors.success : theme.colors.warning }]}>
              <Ionicons name={user?.kycVerified ? 'shield-checkmark' : 'time-outline'} size={22} color={user?.kycVerified ? theme.colors.success : theme.colors.warning} />
              <View style={{ flex: 1, marginLeft: spacing[3] }}>
                <Text style={[textVariants.titleMedium, { color: user?.kycVerified ? theme.colors.success : theme.colors.warning }]}>
                  {user?.kycVerified ? 'KYC Verified' : 'KYC Pending'}
                </Text>
                <Text style={[textVariants.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                  {user?.kycVerified ? 'Your identity has been verified.' : 'Complete KYC to unlock all features.'}
                </Text>
              </View>
            </View>

            <Text style={[textVariants.titleMedium, { color: theme.colors.textPrimary, marginBottom: spacing[3], marginTop: spacing[4] }]}>
              Verification Steps
            </Text>
            {KYC_STEPS.map((step, i) => (
              <View key={step.label} style={[styles.kycStep, { borderBottomColor: theme.colors.divider, borderBottomWidth: i < KYC_STEPS.length - 1 ? 1 : 0 }]}>
                <View style={[styles.kycIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
                  <Ionicons name={step.icon} size={18} color={theme.colors.primary} />
                </View>
                <Text style={[textVariants.bodyMedium, { color: theme.colors.textPrimary, flex: 1 }]}>{step.label}</Text>
                <Ionicons
                  name={user?.kycVerified ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={user?.kycVerified ? theme.colors.success : theme.colors.border}
                />
              </View>
            ))}

            {!user?.kycVerified && (
              <GradientButton title="Start KYC Verification" onPress={() => { setShowKYC(false); Alert.alert('Coming Soon', 'KYC verification will be available in the next update.'); }} style={{ marginTop: spacing[5] }} />
            )}
          </View>
        </View>
      </Modal>

      {/* ── Credit Score Modal ───────────────────────────────────── */}
      <Modal visible={showCredit} animationType="slide" transparent onRequestClose={() => setShowCredit(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: modalBg }]}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={[textVariants.headlineSmall, { color: theme.colors.textPrimary }]}>Credit Score</Text>
              <TouchableOpacity onPress={() => setShowCredit(false)}>
                <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.creditRing}>
              <AnimatedProgressRing
                progress={Math.round((creditScore / 900) * 100)}
                size={130}
                strokeWidth={10}
                label={String(creditScore)}
                sublabel={creditLabel}
                gradientColors={[creditColor, `${creditColor}88`]}
              />
            </View>

            <Text style={[textVariants.bodySmall, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: spacing[5] }]}>
              Score range: 300 – 900
            </Text>

            {[
              { range: '750 – 900', label: 'Excellent', color: '#10B981', desc: 'Best loan rates, instant approvals' },
              { range: '700 – 749', label: 'Good', color: '#06B6D4', desc: 'Competitive rates, easy approvals' },
              { range: '650 – 699', label: 'Fair', color: '#F59E0B', desc: 'Average rates, some checks required' },
              { range: '300 – 649', label: 'Poor', color: '#EF4444', desc: 'Higher rates, may need a guarantor' },
            ].map((band) => (
              <View key={band.label} style={[styles.creditBand, { borderLeftColor: band.color, backgroundColor: creditLabel === band.label ? `${band.color}12` : 'transparent' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[textVariants.labelMedium, { color: band.color }]}>{band.label}  <Text style={[textVariants.caption, { color: theme.colors.textTertiary }]}>{band.range}</Text></Text>
                  <Text style={[textVariants.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>{band.desc}</Text>
                </View>
                {creditLabel === band.label && <Ionicons name="checkmark-circle" size={18} color={band.color} />}
              </View>
            ))}
          </View>
        </View>
      </Modal>
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

  // Modals
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: spacing[6], paddingBottom: Platform.OS === 'ios' ? 40 : spacing[6] },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(128,128,128,0.35)', alignSelf: 'center', marginBottom: spacing[4] },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[5] },
  fieldLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: spacing[2] },
  inputBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: borderRadius.xl, paddingHorizontal: spacing[4], paddingVertical: spacing[3], marginBottom: spacing[4] },
  emailRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: borderRadius.lg, padding: spacing[3], marginTop: spacing[1] },

  // KYC
  kycBanner: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: borderRadius.xl, padding: spacing[4] },
  kycStep: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[3] },
  kycIcon: { width: 36, height: 36, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing[3] },

  // Credit Score
  creditRing: { alignItems: 'center', marginVertical: spacing[4] },
  creditBand: { borderLeftWidth: 3, borderRadius: borderRadius.md, paddingVertical: spacing[3], paddingHorizontal: spacing[3], marginBottom: spacing[2], flexDirection: 'row', alignItems: 'center' },
});
