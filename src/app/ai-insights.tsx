import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useInsights, useMarkInsightRead } from '@hooks/useAnalytics';
import { useAnalytics } from '@hooks/useAnalytics';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { InsightCard, EmptyState, CardSkeleton, RecommendationCard } from '@components/ui/index';

type MainTab = 'insights' | 'recommendations';
const INSIGHT_FILTERS = ['All', 'Opportunity', 'Warning', 'Tip', 'Achievement'] as const;

export default function AIInsightsScreen() {
  const { theme, isDark } = useTheme();
  const { data, isLoading } = useInsights();
  const { recommendations, isLoading: recsLoading, loadRecommendations } = useAnalytics();
  const { mutate: markRead } = useMarkInsightRead();
  const [mainTab, setMainTab] = useState<MainTab>('insights');
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const insights = data?.data ?? [];
  const filtered = activeFilter === 'All'
    ? insights
    : insights.filter((i) => i.type === activeFilter.toLowerCase());
  const unreadCount = insights.filter((i) => !i.isRead).length;

  // Load recommendations when that tab is first selected
  const handleTabChange = (tab: MainTab) => {
    setMainTab(tab);
    if (tab === 'recommendations' && recommendations.length === 0) {
      loadRecommendations();
    }
  };

  const handleInsightPress = (insightId: string) => markRead(insightId);

  const bgColors = isDark ? ['#0A0A0F', '#0F0F1A'] as const : ['#F0F2FF', '#F8F9FF'] as const;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[textVariants.headlineLarge, { color: theme.colors.textPrimary }]}>AI Insights</Text>
          {unreadCount > 0 && (
            <Text style={[textVariants.caption, { color: theme.colors.primary }]}>{unreadCount} new insights</Text>
          )}
        </View>
        <LinearGradient colors={theme.gradients.primary as [string, string]} style={styles.aiChip}>
          <Ionicons name="sparkles" size={14} color="#fff" />
          <Text style={[textVariants.caption, { color: '#fff', marginLeft: 4 }]}>AI</Text>
        </LinearGradient>
      </MotiView>

      {/* Main Tabs */}
      <View style={[styles.mainTabs, { backgroundColor: theme.colors.surface }]}>
        {(['insights', 'recommendations'] as MainTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => handleTabChange(tab)}
            style={[styles.mainTab, mainTab === tab && { backgroundColor: theme.colors.primary }]}
          >
            <Text style={[textVariants.labelMedium, { color: mainTab === tab ? '#fff' : theme.colors.textSecondary }]}>
              {tab === 'insights' ? 'Insights' : 'Strategies'}
            </Text>
            {tab === 'insights' && unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {mainTab === 'insights' ? (
        <>
          {/* Filter Pills */}
          <MotiView from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: 100 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
              {INSIGHT_FILTERS.map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setActiveFilter(f)}
                  style={[styles.pill, { backgroundColor: activeFilter === f ? theme.colors.primary : theme.colors.surface, borderColor: activeFilter === f ? theme.colors.primary : theme.colors.border }]}
                >
                  <Text style={[textVariants.labelMedium, { color: activeFilter === f ? '#fff' : theme.colors.textSecondary }]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </MotiView>

          {isLoading ? (
            <View style={styles.list}>
              {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
            </View>
          ) : filtered.length === 0 ? (
            <EmptyState icon="bulb-outline" title="No insights found" subtitle="Check back later for AI-powered recommendations" />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <InsightCard insight={item} index={index} onPress={() => handleInsightPress(item.id)} />
              )}
              ListFooterComponent={<View style={{ height: 40 }} />}
            />
          )}
        </>
      ) : (
        <>
          {/* Strategies summary */}
          <MotiView from={{ opacity: 0, translateY: -10 }} animate={{ opacity: 1, translateY: 0 }} style={styles.strategySummary}>
            <LinearGradient colors={['rgba(124,58,237,0.15)', 'transparent']} style={styles.summaryCard}>
              <Ionicons name="bulb" size={18} color={theme.colors.primary} />
              <Text style={[textVariants.bodySmall, { color: theme.colors.textSecondary, flex: 1, marginLeft: spacing[2] }]}>
                AI has analyzed your 4 loans and identified {recommendations.length} personalized strategies to reduce your debt faster.
              </Text>
            </LinearGradient>
          </MotiView>

          {recsLoading ? (
            <View style={styles.list}>
              {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
            </View>
          ) : recommendations.length === 0 ? (
            <EmptyState icon="analytics-outline" title="Generating strategies" subtitle="AI is analyzing your loan portfolio..." actionLabel="Refresh" onAction={loadRecommendations} />
          ) : (
            <FlatList
              data={recommendations}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => <RecommendationCard rec={item} index={index} />}
              ListFooterComponent={<View style={{ height: 40 }} />}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[5], paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingBottom: spacing[4], gap: spacing[3] },
  backBtn: { width: 40, height: 40, borderRadius: borderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  aiChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: borderRadius.full },
  mainTabs: { flexDirection: 'row', marginHorizontal: spacing[5], borderRadius: borderRadius.lg, padding: 4, marginBottom: spacing[3] },
  mainTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing[2], borderRadius: borderRadius.md, gap: spacing[1] },
  badge: { backgroundColor: '#EF4444', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  filterList: { paddingHorizontal: spacing[5], gap: spacing[2], paddingBottom: spacing[3] },
  pill: { paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderRadius: borderRadius.full, borderWidth: 1 },
  list: { paddingHorizontal: spacing[5] },
  strategySummary: { paddingHorizontal: spacing[5], marginBottom: spacing[3] },
  summaryCard: { flexDirection: 'row', alignItems: 'center', padding: spacing[3], borderRadius: borderRadius.lg },
});
