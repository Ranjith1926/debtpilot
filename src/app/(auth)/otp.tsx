import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@hooks/useAuth';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { OTPInput, GradientButton } from '@components/ui/index';

const OTP_RESEND_SECONDS = 30;

export default function OTPScreen() {
  const { theme, isDark } = useTheme();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { verifyOTP, isLoading, error } = useAuth();
  const [otp, setOTP] = useState('');
  const [countdown, setCountdown] = useState(OTP_RESEND_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    const result = await verifyOTP({ phone: phone ?? '', otp });
    if (result.meta.requestStatus === 'fulfilled') {
      router.replace('/(tabs)/dashboard');
    }
  };

  const handleResend = () => {
    setCountdown(OTP_RESEND_SECONDS);
    setOTP('');
  };

  const bgColors = isDark
    ? ['#0A0A0F', '#0F0F1A'] as const
    : ['#F0F2FF', '#EDE9FE'] as const;

  return (
    // Root View owns the gradient so it covers the whole screen including safe areas
    <View style={styles.root}>
      <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} />

      <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.topRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </MotiView>

      <View style={styles.content}>
        <MotiView from={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 100 }}>
          <LinearGradient colors={['#7C3AED', '#06B6D4']} style={styles.iconBg}>
            <Ionicons name="shield-checkmark" size={40} color="#fff" />
          </LinearGradient>
        </MotiView>

        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 200 }}>
          <Text style={[textVariants.displaySmall, { color: theme.colors.textPrimary, textAlign: 'center', marginTop: spacing[6] }]}>
            Verify OTP
          </Text>
          <Text style={[textVariants.bodyMedium, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: spacing[2] }]}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={[textVariants.titleMedium, { color: theme.colors.textPrimary }]}>{phone}</Text>
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 350 }}
          style={styles.otpSection}
        >
          <OTPInput value={otp} onChange={setOTP} error={!!error} />

          {error && (
            <View style={[styles.errorRow, { backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', borderWidth: 1 }]}>
              <Ionicons name="alert-circle" size={14} color={theme.colors.error} />
              <Text style={[textVariants.caption, { color: theme.colors.error, marginLeft: spacing[1] }]}>{error}</Text>
            </View>
          )}

          <GradientButton
            title="Verify OTP"
            onPress={handleVerify}
            isLoading={isLoading}
            disabled={otp.length !== 6}
            style={styles.verifyBtn}
          />

          <View style={styles.resendRow}>
            {countdown > 0 ? (
              <Text style={[textVariants.bodyMedium, { color: theme.colors.textSecondary }]}>
                Resend OTP in{' '}
                <Text style={[textVariants.labelMedium, { color: theme.colors.primary }]}>
                  00:{countdown.toString().padStart(2, '0')}
                </Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={[textVariants.labelMedium, { color: theme.colors.primary }]}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={[textVariants.caption, { color: theme.colors.textTertiary, textAlign: 'center' }]}>
            Demo: Use any 6-digit OTP
          </Text>
        </MotiView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topRow: { paddingHorizontal: spacing[6], paddingTop: Platform.OS === 'ios' ? 56 : 40 },
  backBtn: { width: 40, height: 40, borderRadius: borderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing[6] },
  iconBg: { width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  otpSection: { width: '100%', marginTop: spacing[8] },
  errorRow: { flexDirection: 'row', alignItems: 'center', padding: spacing[3], borderRadius: borderRadius.lg, marginTop: spacing[4] },
  verifyBtn: { marginTop: spacing[6] },
  resendRow: { alignItems: 'center', marginTop: spacing[4], marginBottom: spacing[3] },
});
