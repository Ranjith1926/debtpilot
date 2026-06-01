import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useAddLoan } from '@hooks/useLoans';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { addLoanSchema, AddLoanFormData } from '@utils/validation';
import { getLoanTypeColor } from '@utils/loan.utils';
import { CustomInput, GradientButton } from '@components/ui/index';
import { LOAN_TYPE_LABELS } from '@constants/app.constants';
import { LoanType } from '@/types/loan.types';

const LOAN_TYPES: LoanType[] = ['home', 'car', 'personal', 'education', 'business', 'gold', 'credit_card'];

export default function AddLoanScreen() {
  const { theme, isDark } = useTheme();
  const { mutateAsync: addLoan, isPending } = useAddLoan();

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<AddLoanFormData>({
    resolver: zodResolver(addLoanSchema),
    defaultValues: { emiDueDate: 5, tenureMonths: 12 },
  });

  const selectedType = watch('type');

  const onSubmit = async (data: AddLoanFormData) => {
    await addLoan(data);
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LinearGradient colors={isDark ? ['#0A0A0F', '#0F0F1A'] as const : ['#F0F2FF', '#F8F9FF'] as const} style={StyleSheet.absoluteFill} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.closeBtn, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="close" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[textVariants.headlineSmall, { color: theme.colors.textPrimary }]}>Add New Loan</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }}>
            {/* Loan Type Selection */}
            <Text style={[textVariants.labelLarge, { color: theme.colors.textSecondary, marginBottom: spacing[3] }]}>
              LOAN TYPE <Text style={{ color: theme.colors.error }}>*</Text>
            </Text>
            <View style={styles.typeGrid}>
              {LOAN_TYPES.map((type) => {
                const isSelected = selectedType === type;
                const color = getLoanTypeColor(type);
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setValue('type', type)}
                    style={[styles.typeCard, { borderColor: isSelected ? color : theme.colors.border, backgroundColor: isSelected ? `${color}15` : theme.colors.surface }]}
                  >
                    {isSelected && (
                      <LinearGradient colors={[`${color}20`, 'transparent']} style={StyleSheet.absoluteFill} />
                    )}
                    <Text style={[textVariants.labelMedium, { color: isSelected ? color : theme.colors.textSecondary, fontSize: 12 }]}>
                      {LOAN_TYPE_LABELS[type]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.type && <Text style={[textVariants.caption, { color: theme.colors.error, marginBottom: spacing[3] }]}>{errors.type.message}</Text>}

            {/* Lender Name */}
            <Controller control={control} name="lenderName"
              render={({ field: { onChange, value, onBlur } }) => (
                <CustomInput label="Lender Name" placeholder="e.g. HDFC Bank, SBI" leftIcon="business-outline"
                  value={value} onChangeText={onChange} onBlur={onBlur} error={errors.lenderName?.message} isRequired />
              )}
            />

            {/* Principal Amount */}
            <Controller control={control} name="principalAmount"
              render={({ field: { onChange, value, onBlur } }) => (
                <CustomInput label="Loan Amount (₹)" placeholder="e.g. 500000" leftIcon="cash-outline" keyboardType="numeric"
                  value={value?.toString()} onChangeText={(t) => onChange(Number(t))} onBlur={onBlur} error={errors.principalAmount?.message} isRequired />
              )}
            />

            <View style={styles.row}>
              {/* Interest Rate */}
              <Controller control={control} name="interestRate"
                render={({ field: { onChange, value, onBlur } }) => (
                  <CustomInput label="Interest Rate (%)" placeholder="8.5" leftIcon="trending-up-outline" keyboardType="decimal-pad"
                    value={value?.toString()} onChangeText={(t) => onChange(Number(t))} onBlur={onBlur} error={errors.interestRate?.message}
                    containerStyle={{ flex: 1, marginRight: spacing[2] }} isRequired />
                )}
              />
              {/* Tenure */}
              <Controller control={control} name="tenureMonths"
                render={({ field: { onChange, value, onBlur } }) => (
                  <CustomInput label="Tenure (Months)" placeholder="60" leftIcon="time-outline" keyboardType="numeric"
                    value={value?.toString()} onChangeText={(t) => onChange(Number(t))} onBlur={onBlur} error={errors.tenureMonths?.message}
                    containerStyle={{ flex: 1, marginLeft: spacing[2] }} isRequired />
                )}
              />
            </View>

            {/* Start Date */}
            <Controller control={control} name="startDate"
              render={({ field: { onChange, value, onBlur } }) => (
                <CustomInput label="Start Date (YYYY-MM-DD)" placeholder="2024-01-01" leftIcon="calendar-outline"
                  value={value} onChangeText={onChange} onBlur={onBlur} error={errors.startDate?.message} isRequired />
              )}
            />

            {/* Account Number */}
            <Controller control={control} name="accountNumber"
              render={({ field: { onChange, value, onBlur } }) => (
                <CustomInput label="Account Number (Optional)" placeholder="Loan account number" leftIcon="card-outline"
                  value={value} onChangeText={onChange} onBlur={onBlur} />
              )}
            />

            <GradientButton title="Add Loan" onPress={handleSubmit(onSubmit)} isLoading={isPending} style={{ marginTop: spacing[2] }} />
          </MotiView>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[5], paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingBottom: spacing[4] },
  closeBtn: { width: 40, height: 40, borderRadius: borderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: spacing[5] },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[4] },
  typeCard: { paddingHorizontal: spacing[3], paddingVertical: spacing[2.5], borderRadius: borderRadius.lg, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row' },
});
