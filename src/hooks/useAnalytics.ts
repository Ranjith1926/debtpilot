import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import {
  fetchAnalytics, fetchMonthlyData, fetchDistribution,
  fetchInsights, fetchHealthScore, fetchRecommendations,
  markInsightRead, markAllInsightsRead,
} from '@store/slices/analytics.slice';
import { AnalyticsService } from '@services/analytics.service';
import { QUERY_KEYS } from '@constants/app.constants';

// ─── React Query hooks (used by existing screens) ────────────────────────────

export const useMonthlyAnalytics = () =>
  useQuery({
    queryKey: QUERY_KEYS.ANALYTICS,
    queryFn: AnalyticsService.getMonthlyData,
    staleTime: 10 * 60 * 1000,
  });

export const useLoanDistribution = () =>
  useQuery({
    queryKey: [...QUERY_KEYS.ANALYTICS, 'distribution'],
    queryFn: AnalyticsService.getLoanDistribution,
    staleTime: 10 * 60 * 1000,
  });

export const useInsights = () =>
  useQuery({
    queryKey: QUERY_KEYS.INSIGHTS,
    queryFn: AnalyticsService.getInsights,
    staleTime: 5 * 60 * 1000,
  });

export const useRemindersQuery = () =>
  useQuery({
    queryKey: QUERY_KEYS.REMINDERS,
    queryFn: AnalyticsService.getReminders,
    staleTime: 5 * 60 * 1000,
  });

// Alias for backward compat with existing screens
export const useReminders = useRemindersQuery;

export const useMarkInsightRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (insightId: string) => {
      const { MockAPI } = await import('@api/mock.client');
      await MockAPI.insights.markRead(insightId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INSIGHTS }),
  });
};

// ─── Combined Redux hook (for pages that need richer Redux-powered state) ───

export const useAnalytics = () => {
  const dispatch = useAppDispatch();
  const {
    monthlyData, distribution, insights, healthScore, recommendations,
    isLoading, isLoadingInsights, isLoadingHealth, error,
  } = useAppSelector((s) => s.analytics);

  const loadAll = useCallback(() => dispatch(fetchAnalytics()), [dispatch]);
  const loadMonthlyData = useCallback(() => dispatch(fetchMonthlyData()), [dispatch]);
  const loadDistribution = useCallback(() => dispatch(fetchDistribution()), [dispatch]);
  const loadInsights = useCallback(() => dispatch(fetchInsights()), [dispatch]);
  const loadHealthScore = useCallback(() => dispatch(fetchHealthScore()), [dispatch]);
  const loadRecommendations = useCallback(() => dispatch(fetchRecommendations()), [dispatch]);
  const readInsight = useCallback((id: string) => dispatch(markInsightRead(id)), [dispatch]);
  const readAllInsights = useCallback(() => dispatch(markAllInsightsRead()), [dispatch]);

  const unreadInsightsCount = insights.filter((i) => !i.isRead).length;
  const highPriorityInsights = insights.filter((i) => i.priority === 'high');
  const totalInterestPaid = monthlyData.reduce((s, m) => s + m.interestPaid, 0);
  const totalPrincipalPaid = monthlyData.reduce((s, m) => s + m.principalPaid, 0);
  const interestToTotalRatio =
    totalInterestPaid > 0 ? Math.round((totalInterestPaid / (totalInterestPaid + totalPrincipalPaid)) * 100) : 0;

  return {
    monthlyData, distribution, insights, healthScore, recommendations,
    isLoading, isLoadingInsights, isLoadingHealth, error,
    unreadInsightsCount, highPriorityInsights,
    totalInterestPaid, totalPrincipalPaid, interestToTotalRatio,
    loadAll, loadMonthlyData, loadDistribution, loadInsights,
    loadHealthScore, loadRecommendations, readInsight, readAllInsights,
  };
};
