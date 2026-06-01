import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { fetchHealthScore } from '@store/slices/analytics.slice';

const SCORE_LABELS: Record<string, { label: string; color: string; gradient: [string, string] }> = {
  excellent: { label: 'Excellent', color: '#10B981', gradient: ['#059669', '#10B981'] },
  good: { label: 'Good', color: '#06B6D4', gradient: ['#0891B2', '#06B6D4'] },
  average: { label: 'Average', color: '#F59E0B', gradient: ['#D97706', '#F59E0B'] },
  poor: { label: 'Needs Work', color: '#EF4444', gradient: ['#DC2626', '#EF4444'] },
};

const getScoreInfo = (score: number) => {
  if (score >= 80) return SCORE_LABELS.excellent;
  if (score >= 60) return SCORE_LABELS.good;
  if (score >= 40) return SCORE_LABELS.average;
  return SCORE_LABELS.poor;
};

export const useFinancialHealth = () => {
  const dispatch = useAppDispatch();
  const { healthScore, isLoadingHealth } = useAppSelector((s) => s.analytics);
  const { monthlyIncome } = useAppSelector((s) => s.settings);

  const refresh = useCallback(() => dispatch(fetchHealthScore()), [dispatch]);

  const overallScore = healthScore?.overallScore ?? 0;
  const scoreLabel = getScoreInfo(overallScore);
  const isHealthy = overallScore >= 60;
  const isAtRisk = overallScore < 40;

  const emiAffordabilityStatus =
    !healthScore ? 'unknown'
    : healthScore.emiToIncomeRatio > 60 ? 'critical'
    : healthScore.emiToIncomeRatio > 40 ? 'warning'
    : 'healthy';

  return {
    healthScore,
    overallScore,
    isLoadingHealth,
    scoreLabel,
    isHealthy,
    isAtRisk,
    monthlyIncome,
    emiAffordabilityStatus,
    refresh,
  };
};
