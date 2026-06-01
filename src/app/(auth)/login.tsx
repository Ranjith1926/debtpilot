import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@hooks/useAuth';
import { useBiometric } from '@hooks/useBiometric';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { loginSchema, LoginFormData } from '@utils/validation';
import { CustomInput, GradientButton } from '@components/ui/index';

export default function LoginScreen() {
  const { theme, isDark } = useTheme();
  const { login, isLoading, error } = useAuth();
  const { isAvailable: biometricAvailable, authenticate } = useBiometric();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await login({ email: data.email, password: data.password });
    if (result.meta.requestStatus === 'fulfilled') {
      router.replace('/(tabs)/dashboard');
    }
  };

  const handleBiometric = async () => {
    const result = await authenticate('Login to DebtPilot');
    if (result.success) router.replace('/(tabs)/dashboard');
  };

  const bgColors = isDark
    ? ['#0A0A0F', '#0F0F1A', '#0A0A0F'] as const
    : ['#F0F2FF', '#EDE9FE', '#F0F2FF'] as const;

  return (
    // Root fills the whole screen — gradient lives here, not inside ScrollView
    <View style={styles.root}>
      <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} />

      {/* Decorative orb */}
      <View style={[styles.orb, { backgroundColor: isDark ? 'rgba(124,58,237,0.22)' : 'rgba(124,58,237,0.10)' }]} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          // Transparent so the root gradient shows through
        >
          {/* Logo + title */}
          <MotiView from={{ opacity: 0, translateY: -20 }} animate={{ opacity: 1, translateY: 0 }} style={styles.header}>
            <LinearGradient colors={['#7C3AED', '#06B6D4']} style={styles.logo}>
              <Text style={styles.logoText}>DP</Text>
            </LinearGradient>
            <Text style={[textVariants.displaySmall, { color: theme.colors.textPrimary, marginTop: spacing[4] }]}>
              Welcome Back
            </Text>
            <Text style={[textVariants.bodyMedium, { color: theme.colors.textSecondary, marginTop: spacing[1] }]}>
              Manage your EMIs smarter
            </Text>
          </MotiView>

          {/* Form */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
            style={styles.form}
          >
            {error && (
              <View style={[styles.errorBanner, { backgroundColor: 'rgba(239,68,68,0.10)', borderColor: 'rgba(239,68,68,0.25)', borderWidth: 1 }]}>
                <Ionicons name="alert-circle" size={16} color={theme.colors.error} />
                <Text style={[textVariants.bodySmall, { color: theme.colors.error, marginLeft: spacing[2], flex: 1 }]}>
                  {error}
                </Text>
              </View>
            )}

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value, onBlur } }) => (
                <CustomInput
                  label="Email"
                  placeholder="your@email.com"
                  leftIcon="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  isRequired
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value, onBlur } }) => (
                <CustomInput
                  label="Password"
                  placeholder="Enter your password"
                  leftIcon="lock-closed-outline"
                  isPassword
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  isRequired
                />
              )}
            />

            <TouchableOpacity style={styles.forgotBtn} onPress={() => {}}>
              <Text style={[textVariants.labelMedium, { color: theme.colors.primary }]}>Forgot Password?</Text>
            </TouchableOpacity>

            <GradientButton
              title="Login"
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              style={styles.loginBtn}
            />

            {biometricAvailable && (
              <TouchableOpacity
                style={[styles.biometricBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
                onPress={handleBiometric}
              >
                <Ionicons name="finger-print" size={22} color={theme.colors.primary} />
                <Text style={[textVariants.labelMedium, { color: theme.colors.textSecondary, marginLeft: spacing[2] }]}>
                  Login with Biometric
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.registerRow}>
              <Text style={[textVariants.bodyMedium, { color: theme.colors.textSecondary }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={[textVariants.labelMedium, { color: theme.colors.primary }]}>Register</Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Root View fills the ENTIRE screen — background + gradient live here
  root: { flex: 1 },
  flex: { flex: 1 },
  // ScrollView content grows to fill remaining space so no gap appears
  scrollContent: { flexGrow: 1, paddingBottom: spacing[8] },
  orb: { position: 'absolute', width: 280, height: 280, borderRadius: 140, top: -80, right: -60 },
  header: { alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 80 : 60, paddingHorizontal: spacing[6] },
  logo: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 28, fontWeight: '900', color: '#fff' },
  form: { padding: spacing[6], paddingTop: spacing[8] },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
  },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: spacing[6], marginTop: -spacing[2] },
  loginBtn: { marginBottom: spacing[4] },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing[6],
  },
  registerRow: { flexDirection: 'row', justifyContent: 'center' },
});
