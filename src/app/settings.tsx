import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { GlassCard } from '@components/ui/index';
import { SUPPORTED_LANGUAGES } from '@localization/i18n';
import { useTranslation } from 'react-i18next';

export default function SettingsScreen() {
  const { theme, isDark } = useTheme();
  const { i18n } = useTranslation();

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient colors={isDark ? ['#0A0A0F', '#0F0F1A'] as const : ['#F0F2FF', '#F8F9FF'] as const} style={StyleSheet.absoluteFill} />

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
                onPress={() => handleLanguageChange(lang.code)}
              >
                <View>
                  <Text style={[textVariants.titleMedium, { color: theme.colors.textPrimary }]}>{lang.nativeLabel}</Text>
                  <Text style={[textVariants.caption, { color: theme.colors.textSecondary }]}>{lang.label}</Text>
                </View>
                {i18n.language === lang.code && (
                  <LinearGradient colors={theme.gradients.primary as [string, string]} style={styles.checkBg}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </LinearGradient>
                )}
              </TouchableOpacity>
            ))}
          </GlassCard>
        </MotiView>

        {/* Account Settings */}
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 200 }}>
          <Text style={[textVariants.labelLarge, { color: theme.colors.textTertiary, marginBottom: spacing[3], marginTop: spacing[6] }]}>ACCOUNT</Text>
          <GlassCard noPadding>
            {[
              { icon: 'download-outline' as const, label: 'Export My Data', desc: 'Download all your loan data as CSV' },
              { icon: 'lock-closed-outline' as const, label: 'Change Password', desc: 'Update your account password' },
              { icon: 'card-outline' as const, label: 'Auto Debit Setup', desc: 'Configure automatic EMI payments' },
            ].map((item, i, arr) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.settingsItem, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.divider }]}
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
              onPress={() => Alert.alert('Delete Account', 'This action cannot be undone. All your data will be permanently deleted.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => {} },
              ])}
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
});
