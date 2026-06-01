import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useLoans } from '@hooks/useLoans';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { formatCurrency } from '@utils/format';
import { LoanSummaryCard, FloatingActionButton, EmptyState, CardSkeleton } from '@components/ui/index';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 82 : 62;

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'home', label: 'Home' },
  { key: 'car', label: 'Car' },
  { key: 'personal', label: 'Personal' },
  { key: 'education', label: 'Education' },
];

export default function LoansScreen() {
  const { theme, isDark } = useTheme();
  const { data: loansData, isLoading, refetch } = useLoans();
  const [activeFilter, setActiveFilter] = useState('all');

  const loans = loansData?.data ?? [];
  const filteredLoans = activeFilter === 'all' ? loans : loans.filter((l) => l.type === activeFilter);
  const totalOutstanding = loans.reduce((sum, l) => sum + l.outstandingAmount, 0);

  const bgColors = isDark
    ? ['#0A0A0F', '#0F0F1A'] as const
    : ['#F0F2FF', '#F8F9FF'] as const;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[textVariants.headlineLarge, { color: theme.colors.textPrimary }]}>My Loans</Text>
          <Text style={[textVariants.bodySmall, { color: theme.colors.textSecondary, marginTop: 2 }]}>
            {loans.length} active · {formatCurrency(totalOutstanding, true)} outstanding
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/loan/add')}
          style={[styles.addBtn, { borderColor: theme.colors.primary, borderWidth: 1.5 }]}
        >
          <Ionicons name="add" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </MotiView>

      {/* Filter Tabs */}
      <MotiView from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: 100 }}>
        <FlatList
          horizontal
          data={FILTER_TABS}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            const isActive = activeFilter === item.key;
            return (
              <TouchableOpacity
                onPress={() => setActiveFilter(item.key)}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: isActive ? 'transparent' : theme.colors.surface,
                    borderColor: isActive ? 'transparent' : theme.colors.border,
                    borderWidth: 1,
                    overflow: 'hidden',
                  },
                ]}
                activeOpacity={0.75}
              >
                {isActive && (
                  <LinearGradient
                    colors={theme.gradients.primary as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <Text
                  numberOfLines={1}
                  style={[
                    textVariants.labelMedium,
                    { color: isActive ? '#fff' : theme.colors.textSecondary },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </MotiView>

      {/* Loans List */}
      {isLoading ? (
        <View style={styles.listContent}>
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </View>
      ) : filteredLoans.length === 0 ? (
        <EmptyState
          icon="card-outline"
          title="No loans found"
          subtitle="Add your first loan to start tracking"
          actionLabel="Add Loan"
          onAction={() => router.push('/loan/add')}
        />
      ) : (
        <FlatList
          data={filteredLoans}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: TAB_BAR_HEIGHT + spacing[6] }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <LoanSummaryCard
              loan={item}
              index={index}
              onPress={() => router.push(`/loan/${item.id}`)}
            />
          )}
        />
      )}

      <View style={styles.fab}>
        <FloatingActionButton onPress={() => router.push('/loan/add')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: spacing[4],
  },
  headerLeft: { flex: 1, marginRight: spacing[3] },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  filterList: {
    paddingHorizontal: spacing[5],
    gap: spacing[2],
    paddingBottom: spacing[3],
  },
  filterTab: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
  },
  listContent: { paddingHorizontal: spacing[5] },
  fab: { position: 'absolute', bottom: Platform.OS === 'ios' ? 96 : 72, right: spacing[5] },
});
