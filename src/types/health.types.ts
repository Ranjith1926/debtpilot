import { FinancialHealthMetric } from './analytics.types';

export type HealthTrend = 'up' | 'down' | 'stable';
export type RecommendationType = 'preclosure' | 'avalanche' | 'snowball' | 'refinance' | 'credit_improvement' | 'emi_optimization';
export type RecommendationDifficulty = 'easy' | 'medium' | 'hard';

export interface FinancialHealthScore {
  overallScore: number;
  creditScore: number;
  emiToIncomeRatio: number;
  creditUtilization: number;
  paymentHistoryScore: number;
  debtConsistencyScore: number;
  savingsRatio: number;
  metrics: FinancialHealthMetric[];
  lastUpdated: string;
  trend: HealthTrend;
  trendValue: number;
}

export interface Recommendation {
  id: string;
  type: RecommendationType;
  loanId?: string;
  loanName?: string;
  title: string;
  description: string;
  savingsAmount?: number;
  requiredAmount?: number;
  monthlyExtraPayment?: number;
  newInterestRate?: number;
  timeToImplement: string;
  difficulty: RecommendationDifficulty;
  priority: 'high' | 'medium' | 'low';
  payoffOrder?: string[];
  steps: string[];
}

export interface PreClosureCalculation {
  loanId: string;
  outstandingAmount: number;
  forecloseCharges: number;
  forecloseChargeAmount: number;
  totalPayable: number;
  interestSaved: number;
  netSavings: number;
  remainingEMIs: number;
  remainingInterest: number;
}

export interface SnowballPlan {
  payoffOrder: Array<{ loanId: string; loanName: string; outstandingAmount: number; emiAmount: number }>;
  totalSavings: number;
  totalMonths: number;
  monthlyExtra: number;
}

export interface AvalanchePlan {
  payoffOrder: Array<{ loanId: string; loanName: string; interestRate: number; outstandingAmount: number }>;
  totalSavings: number;
  totalMonths: number;
  monthlyExtra: number;
}
