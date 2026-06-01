import { apiClient } from '@api/axios.client';
import { FinancialHealthScore } from '@/types/health.types';
import { Loan, LoanSummary } from '@/types/loan.types';
import { DUMMY_HEALTH_METRICS } from '@constants/dummy-data';
import { ENDPOINTS } from '@constants/endpoints';

export const HealthService = {
  getScore: async (): Promise<FinancialHealthScore> => {
    const res = await apiClient.get(ENDPOINTS.ANALYTICS.HEALTH_SCORE);
    const d = res.data.data ?? {};
    return {
      overallScore: d.healthScore ?? 0,
      creditScore: d.creditScore ?? 0,
      emiToIncomeRatio: d.debtToIncomeRatio ? Number((d.debtToIncomeRatio * 100).toFixed(1)) : 0,
      creditUtilization: 28,
      paymentHistoryScore: d.healthScore ?? 0,
      debtConsistencyScore: 80,
      savingsRatio: 0,
      metrics: DUMMY_HEALTH_METRICS,
      lastUpdated: new Date().toISOString(),
      trend: 'stable',
      trendValue: 0,
    };
  },

  computeScore: (loans: Loan[], summary: LoanSummary, monthlyIncome: number, creditScore: number): FinancialHealthScore => {
    const emiRatio = monthlyIncome > 0 ? (summary.totalEMIPerMonth / monthlyIncome) * 100 : 100;
    const emiScore = Math.max(0, Math.round(100 - emiRatio));
    const paymentHistory = summary.overdueCount === 0 ? 100 : Math.max(0, 100 - summary.overdueCount * 15);
    const creditUtil = 28;
    const creditUtilScore = creditUtil < 30 ? 80 : creditUtil < 50 ? 60 : 40;
    const consistency = loans.filter((l) => l.lastPaymentDate).length > 0 ? 80 : 50;
    const savingsAmount = Math.max(0, monthlyIncome - summary.totalEMIPerMonth);
    const savingsRatioPct = monthlyIncome > 0 ? (savingsAmount / monthlyIncome) * 100 : 0;
    const savingsScore = savingsRatioPct >= 20 ? 100 : Math.round((savingsRatioPct / 20) * 100);
    const overall = Math.round(emiScore * 0.3 + paymentHistory * 0.3 + creditUtilScore * 0.2 + consistency * 0.1 + savingsScore * 0.1);

    return {
      overallScore: overall,
      creditScore,
      emiToIncomeRatio: Math.round(emiRatio * 10) / 10,
      creditUtilization: creditUtil,
      paymentHistoryScore: paymentHistory,
      debtConsistencyScore: consistency,
      savingsRatio: Math.round(savingsRatioPct * 10) / 10,
      metrics: DUMMY_HEALTH_METRICS,
      lastUpdated: new Date().toISOString(),
      trend: 'up',
      trendValue: 3,
    };
  },
};
