import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, Alert, Modal, TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { GlassCard, GradientButton } from '@components/ui/index';
import { SUPPORTED_LANGUAGES } from '@localization/i18n';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@api/axios.client';
import { ENDPOINTS } from '@constants/endpoints';

export default function SettingsScreen() {
  const { theme, isDark } = useTheme();
  const { i18n } = useTranslation();

  const [showChangePwd, setShowChangePwd] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const modalBg = isDark ? '#0F0F1A' : '#F8F9FF';

  const openChangePwd = () => {
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    setShowChangePwd(true);
  };

  const handleChangePassword = async () => {
    if (!currentPwd) { Alert.alert('Error', 'Enter your current password'); return; }
    if (newPwd.length < 8) { Alert.alert('Error', 'New password must be at least 8 characters'); return; }
    if (!/[A-Z]/.test(newPwd)) { Alert.alert('Error', 'New password must contain an uppercase letter'); return; }
    if (!/[0-9]/.test(newPwd)) { Alert.alert('Error', 'New password must contain a number'); return; }
    if (!/[^A-Za-z0-9]/.test(newPwd)) { Alert.alert('Error', 'New password must contain a special character'); return; }
    if (newPwd !== confirmPwd) { Alert.alert('Error', 'Passwords do not match'); return; }

    setIsSaving(true);
    try {
      await apiClient.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword: currentPwd,
        newPassword: newPwd,
      });
      setShowChangePwd(false);
      Alert.alert('Success', 'Password changed successfully.');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to change password.';
      Alert.alert('Error', msg);
    } finally {
      setIsSaving(false);
    }
  };

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
        <Text style={[textVariants.headlineLarge, { color: theme.colors.textPrimary }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </MotiView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Language */}
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 100 }}>
          <Text style={[textVariants.labelLarge, { color: theme.colors.textTertiary, marginBottom: spacing[3] }]}>LANGUAGE</Text>
          <GlassCard noPadding>
            {SUPPORTED_LANGUAGES.map((lang, i) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.languageItem, i < SUPPORTED_LANGUAGES.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.divider }]}
                onPress={() => i18n.changeLanguage(lang.code)}
                activeOpacity={0.7}
              >
                <View>
                  <Text style={[textVariants.titleMedium, { color: theme.colors.textPrimary }]}>{lang.nativeLabel}</Text>
                  <Text style={[textVariants.caption, { color: theme.colors.textSecondary }]}>{lang.label}</Text>
                </View>
                {i18n.language === lang.code ? (
                  <LinearGradient colors={theme.gradients.primary as [string, string]} style={styles.checkBg}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </LinearGradient>
                ) : (
                  <View style={[styles.checkBg, { backgroundColor: theme.colors.surface }]} />
                )}
              </TouchableOpacity>
            ))}
          </GlassCard>
        </MotiView>

        {/* Account */}
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 200 }}>
          <Text style={[textVariants.labelLarge, { color: theme.colors.textTertiary, marginBottom: spacing[3], marginTop: spacing[6] }]}>ACCOUNT</Text>
          <GlassCard noPadding>
            {[
              { icon: 'lock-closed-outline' as const, label: 'Change Password', desc: 'Update your account password', onPress: openChangePwd },
              { icon: 'download-outline' as const, label: 'Export My Data', desc: 'Download all your loan data as CSV', onPress: () => Alert.alert('Coming Soon', 'Data export will be available soon.') },
              { icon: 'card-outline' as const, label: 'Auto Debit Setup', desc: 'Configure automatic EMI payments', onPress: () => Alert.alert('Coming Soon', 'Auto debit setup coming in next update.') },
            ].map((item, i, arr) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.settingsItem, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.divider }]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.itemIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
                  <Ionicons name={item.icon} size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[textVariants.titleMedium, { color: theme.colors.textPrimary }]}>{item.label}</Text>
                  <Text style={[textVariants.caption, { color: theme.colors.textSecondary }]}>{item.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </GlassCard>
        </MotiView>

        {/* Danger Zone */}
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 300 }}>
          <Text style={[textVariants.labelLarge, { color: theme.colors.error, marginBottom: spacing[3], marginTop: spacing[6] }]}>DANGER ZONE</Text>
          <GlassCard noPadding>
            <TouchableOpacity
              style={styles.settingsItem}
              activeOpacity={0.7}
              onPress={() => Alert.alert(
                'Delete Account',
                'This action cannot be undone. All your data will be permanently deleted.',
                [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => {} }],
              )}
            >
              <View style={[styles.itemIcon, { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
                <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
              </View>
              <View style={styles.itemInfo}>
                <Text style={[textVariants.titleMedium, { color: theme.colors.error }]}>Delete Account</Text>
                <Text style={[textVariants.caption, { color: theme.colors.textSecondary }]}>Permanently delete your account and data</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.error} />
            </TouchableOpacity>
          </GlassCard>
        </MotiView>

        <Text style={[textVariants.caption, { color: theme.colors.textTertiary, textAlign: 'center', marginTop: spacing[8], marginBottom: spacing[4] }]}>
          DebtPilot v1.0.0 • Made with ♥ in India
        </Text>
      </ScrollView>

      {/* ── Change Password Modal ─────────────────────────────────── */}
      <Modal visible={showChangePwd} animationType="slide" transparent onRequestClose={() => setShowChangePwd(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: modalBg }]}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={[textVariants.headlineSmall, { color: theme.colors.textPrimary }]}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowChangePwd(false)}>
                <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {[
              { label: 'CURRENT PASSWORD', value: currentPwd, set: setCurrentPwd, show: showCurrent, toggle: () => setShowCurrent(p => !p) },
              { label: 'NEW PASSWORD', value: newPwd, set: setNewPwd, show: showNew, toggle: () => setShowNew(p => !p) },
              { label: 'CONFIRM NEW PASSWORD', value: confirmPwd, set: setConfirmPwd, show: showConfirm, toggle: () => setShowConfirm(p => !p) },
            ].map((field) => (
              <View key={field.label}>
                <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>{field.label}</Text>
                <View style={[styles.inputBox, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                  <Ionicons name="lock-closed-outline" size={17} color={theme.colors.textTertiary} style={{ marginRight: spacing[2] }} />
                  <TextInput
                    style={[textVariants.titleMedium, { color: theme.colors.textPrimary, flex: 1 }]}
                    value={field.value}
                    onChangeText={field.set}
                    secureTextEntry={!field.show}
                    placeholder="••••••••"
                    placeholderTextColor={theme.colors.textTertiary}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={field.toggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name={field.show ? 'eye-off-outline' : 'eye-outline'} size={18} color={theme.colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={[styles.pwdHint, { backgroundColor: `${theme.colors.primary}10`, borderColor: `${theme.colors.primary}30` }]}>
              <Ionicons name="information-circle-outline" size={15} color={theme.colors.primary} />
              <Text style={[textVariants.caption, { color: theme.colors.textSecondary, flex: 1, marginLeft: spacing[2] }]}>
                Min 8 chars · 1 uppercase · 1 number · 1 special character
              </Text>
            </View>

            <GradientButton
              title={isSaving ? 'Saving…' : 'Change Password'}
              onPress={handleChangePassword}
              isLoading={isSaving}
              style={{ marginTop: spacing[4] }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[5], paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingBottom: spacing[4] },
  backBtn: { width: 40, height: 40, borderRadius: borderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: spacing[5] },
  languageItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing[4] },
  checkBg: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  settingsItem: { flexDirection: 'row', alignItems: 'center', padding: spacing[4] },
  itemIcon: { width: 38, height: 38, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing[3] },
  itemInfo: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: spacing[6], paddingBottom: Platform.OS === 'ios' ? 40 : spacing[6] },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(128,128,128,0.35)', alignSelf: 'center', marginBottom: spacing[4] },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[5] },
  fieldLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: spacing[2] },
  inputBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: borderRadius.xl, paddingHorizontal: spacing[4], paddingVertical: spacing[3], marginBottom: spacing[4] },
  pwdHint: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: borderRadius.lg, padding: spacing[3] },
});
