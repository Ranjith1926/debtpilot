import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { registerSchema, RegisterFormData } from '@utils/validation';
import { CustomInput, GradientButton } from '@components/ui/index';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { registerAsync } from '@store/slices/auth.slice';

export default function RegisterScreen() {
  const { theme, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((s) => s.auth);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    const result = await dispatch(registerAsync({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
    }));
    if (result.meta.requestStatus === 'fulfilled') {
      router.replace('/(tabs)/dashboard');
    }
  };

  const bgColors = isDark
    ? ['#0A0A0F', '#0F0F1A'] as const
    : ['#F0F2FF', '#EDE9FE'] as const;

  return (
    <View style={styles.root}>
      <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[textVariants.displaySmall, { color: theme.colors.textPrimary, marginTop: spacing[5] }]}>
            Create Account
          </Text>
          <Text style={[textVariants.bodyMedium, { color: theme.colors.textSecondary, marginTop: spacing[1] }]}>
            Start managing your debts smarter
          </Text>
        </MotiView>

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
            control={control} name="name"
            render={({ field: { onChange, value, onBlur } }) => (
              <CustomInput label="Full Name" placeholder="Enter your full name" leftIcon="person-outline"
                value={value} onChangeText={onChange} onBlur={onBlur} error={errors.name?.message} isRequired />
            )}
          />
          <Controller
            control={control} name="email"
            render={({ field: { onChange, value, onBlur } }) => (
              <CustomInput label="Email" placeholder="your@email.com" leftIcon="mail-outline" keyboardType="email-address"
                value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} isRequired />
            )}
          />
          <Controller
            control={control} name="phone"
            render={({ field: { onChange, value, onBlur } }) => (
              <CustomInput label="Phone Number" placeholder="+91 98765 43210" leftIcon="call-outline" keyboardType="phone-pad"
                value={value} onChangeText={onChange} onBlur={onBlur} error={errors.phone?.message} isRequired />
            )}
          />
          <Controller
            control={control} name="password"
            render={({ field: { onChange, value, onBlur } }) => (
              <CustomInput label="Password" placeholder="Min 8 chars, 1 uppercase, 1 number" leftIcon="lock-closed-outline"
                isPassword value={value} onChangeText={onChange} onBlur={onBlur} error={errors.password?.message} isRequired />
            )}
          />
          <Controller
            control={control} name="confirmPassword"
            render={({ field: { onChange, value, onBlur } }) => (
              <CustomInput label="Confirm Password" placeholder="Re-enter password" leftIcon="lock-closed-outline"
                isPassword value={value} onChangeText={onChange} onBlur={onBlur} error={errors.confirmPassword?.message} isRequired />
            )}
          />

          <GradientButton title="Create Account" onPress={handleSubmit(onSubmit)} isLoading={isLoading} style={{ marginTop: spacing[2] }} />

          <View style={styles.loginRow}>
            <Text style={[textVariants.bodyMedium, { color: theme.colors.textSecondary }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[textVariants.labelMedium, { color: theme.colors.primary }]}>Login</Text>
            </TouchableOpacity>
          </View>
        </MotiView>
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: spacing[8] },
  header: { paddingHorizontal: spacing[6], paddingTop: Platform.OS === 'ios' ? 56 : 40 },
  backBtn: { width: 40, height: 40, borderRadius: borderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  form: { padding: spacing[6], paddingTop: spacing[5] },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing[6] },
  errorBanner: { flexDirection: 'row', alignItems: 'center', padding: spacing[3], borderRadius: borderRadius.lg, marginBottom: spacing[4] },
});
