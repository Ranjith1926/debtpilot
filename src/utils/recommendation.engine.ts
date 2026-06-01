import { Loan } from '@/types/loan.types';
import { AIInsight } from '@/types/analytics.types';
import { calculatePrepaymentImpact, snowballStrategy, avalancheStrategy, calculateEMI } from './financial.calculators';
import { formatCurrency } from './format';

export type RecommendationType = 'opportunity' | 'warning' | 'tip' | 'achievement';
export type Priority = 'high' | 'medium' | 'low';

interface RecommendationContext {
  loans: Loan[];
  monthlyIncome: number;
  creditScore: number;
  missedPayments: number;
  onTimePayments: number;
  monthlySavings: number;
  overdueCount: number;
}

// ─── Individual Recommendation Generators ─────────────────────────────────

const highestRateLoanRecommendation = (loans: Loan[]): AIInsight | null => {
  const active = loans.filter((l) => l.status === 'active' && l.prepaymentAllowed);
  if (active.length === 0) return null;

  const mostExpensive = active.reduce((max, l) => l.interestRate > max.interestRate ? l : max);
  const impact = calculatePrepaymentImpact(
    mostExpensive.outstandingAmount,
    mostExpensive.interestRate,
    Math.round(mostExpensive.outstandingAmount / mostExpensive.emiAmount),
    mostExpensive.emiAmount * 3,
  );

  if (impact.interestSaved < 5000) return null;

  return {
    id: `rec_prepay_${mostExpensive.id}`,
    type: 'opportunity',
    title: `Save ${formatCurrency(impact.interestSaved, true)} on ${mostExpensive.lenderName}`,
    description: `Your ${mostExpensive.lenderName} loan has the highest rate at ${mostExpensive.interestRate}%. Paying 3 extra EMIs (~${formatCurrency(mostExpensive.emiAmount * 3, true)}) saves ${formatCurrency(impact.interestSaved, true)} in interest and closes it ${impact.monthsSaved} months early.`,
    actionLabel: 'Calculate Prepayment',
    actionRoute: `/loan/${mostExpensive.id}`,
    savingsEstimate: impact.interestSaved,
    priority: 'high',
    createdAt: new Date().toISOString().split('T')[0],
    isRead: false,
  };
};

const snowballRecommendation = (loans: Loan[]): AIInsight | null => {
  const active = loans.filter((l) => l.status === 'active');
  if (active.length < 2) return null;

  const loansForStrategy = active.map((l) => ({
    id: l.id,
    name: l.lenderName,
    outstanding: l.outstandingAmount,
    interestRate: l.interestRate,
    emi: l.emiAmount,
    remainingMonths: Math.round(l.outstandingAmount / l.emiAmount),
  }));

  const plan = snowballStrategy(loansForStrategy, 5000);
  const smallestLoan = active.sort((a, b) => a.outstandingAmount - b.outstandingAmount)[0];

  return {
    id: 'rec_snowball',
    type: 'tip',
    title: 'Snowball Strategy: Clear Small Loans First',
    description: `Pay off ${smallestLoan.lenderName} (${formatCurrency(smallestLoan.outstandingAmount, true)} remaining) first. This frees ₹${smallestLoan.emiAmount.toLocaleString('en-IN')}/month which you can redirect to the next loan — creating a powerful payoff momentum.`,
    actionLabel: 'View Strategy',
    actionRoute: '/ai-insights',
    savingsEstimate: Math.round(plan.totalInterest * 0.05),
    priority: 'medium',
    createdAt: new Date().toISOString().split('T')[0],
    isRead: false,
  };
};

const avalancheRecommendation = (loans: Loan[]): AIInsight | null => {
  const active = loans.filter((l) => l.status === 'active');
  if (active.length < 2) return null;

  const loansForStrategy = active.map((l) => ({
    id: l.id,
    name: l.lenderName,
    outstanding: l.outstandingAmount,
    interestRate: l.interestRate,
    emi: l.emiAmount,
    remainingMonths: Math.round(l.outstandingAmount / l.emiAmount),
  }));

  const plan = avalancheStrategy(loansForStrategy, 5000);
  const highest = active.sort((a, b) => b.interestRate - a.interestRate)[0];

  return {
    id: 'rec_avalanche',
    type: 'opportunity',
    title: `Avalanche Method: Attack ${highest.interestRate}% Rate First`,
    description: `Direct extra payments toward ${highest.lenderName} (${highest.interestRate}% p.a.). The avalanche strategy can save you ${formatCurrency(plan.interestSaved, true)} in total interest compared to minimum payments.`,
    actionLabel: 'Compare Strategies',
    actionRoute: '/ai-insights',
    savingsEstimate: plan.interestSaved,
    priority: 'high',
    createdAt: new Date().toISOString().split('T')[0],
    isRead: false,
  };
};

const overdueWarning = (overdueCount: number, overdueAmount: number): AIInsight | null => {
  if (overdueCount === 0) return null;

  return {
    id: 'rec_overdue_warning',
    type: 'warning',
    title: `${overdueCount} Overdue Payment${overdueCount > 1 ? 's' : ''} Hurting Your Score`,
    description: `You have ${overdueCount} overdue EMI${overdueCount > 1 ? 's' : ''} totalling ${formatCurrency(overdueAmount)}. Each missed payment can drop your credit score by 50–100 points. Pay immediately to stop penalty charges accumulating.`,
    actionLabel: 'Pay Now',
    actionRoute: '/(tabs)/loans',
    priority: 'high',
    createdAt: new Date().toISOString().split('T')[0],
    isRead: false,
  };
};

const dtiWarning = (totalEMI: number, income: number): AIInsight | null => {
  if (income <= 0) return null;
  const dti = totalEMI / income;
  if (dti <= 0.4) return null;

  return {
    id: 'rec_dti_warning',
    type: 'warning',
    title: `Debt-to-Income Ratio at ${Math.round(dti * 100)}% — Action Needed`,
    description: `Your EMIs consume ${Math.round(dti * 100)}% of your income. Lenders consider above 40% risky, making future loans difficult. Consider prepaying personal/high-rate loans to bring this below 35%.`,
    actionLabel: 'See Suggestions',
    actionRoute: '/ai-insights',
    priority: 'high',
    createdAt: new Date().toISOString().split('T')[0],
    isRead: false,
  };
};

const paymentStreakAchievement = (onTimePayments: number): AIInsight | null => {
  if (onTimePayments < 6) return null;
  const milestone = onTimePayments >= 24 ? '2-year' : onTimePayments >= 12 ? '1-year' : '6-month';

  return {
    id: `rec_streak_${onTimePayments}`,
    type: 'achievement',
    title: `🏆 ${milestone.charAt(0).toUpperCase() + milestone.slice(1)} Payment Streak!`,
    description: `${onTimePayments} consecutive on-time payments! This consistency is your strongest credit asset. Your credit score has likely improved by 60–120 points from this habit.`,
    priority: 'low',
    createdAt: new Date().toISOString().split('T')[0],
    isRead: false,
  };
};

const refinanceOpportunity = (loans: Loan[]): AIInsight | null => {
  const highRateLoans = loans.filter((l) => l.status === 'active' && l.interestRate > 12);
  if (highRateLoans.length === 0) return null;

  const totalHighRate = highRateLoans.reduce((s, l) => s + l.outstandingAmount, 0);
  const estimatedSavings = Math.round(totalHighRate * 0.02); // 2% rate reduction estimate

  return {
    id: 'rec_refinance',
    type: 'opportunity',
    title: 'Refinancing Could Save You Money',
    description: `${highRateLoans.length} loan${highRateLoans.length > 1 ? 's' : ''} carry rates above 12%. With your good payment history, banks may offer balance transfer at 10–11%, potentially saving ${formatCurrency(estimatedSavings, true)}/year.`,
    actionLabel: 'Explore Options',
    actionRoute: '/ai-insights',
    savingsEstimate: estimatedSavings,
    priority: 'medium',
    createdAt: new Date().toISOString().split('T')[0],
    isRead: false,
  };
};

const emergencyFundTip = (savings: number, totalEMI: number): AIInsight | null => {
  const targetFund = totalEMI * 6; // 6-month EMI buffer
  if (savings >= targetFund) return null;

  const shortfall = targetFund - savings;

  return {
    id: 'rec_emergency_fund',
    type: 'tip',
    title: 'Build 6-Month EMI Buffer First',
    description: `An emergency fund of ${formatCurrency(targetFund, true)} (6× your EMI) protects you from missing payments during job changes or medical emergencies. You need ${formatCurrency(shortfall, true)} more. Start with ₹2,000/month auto-transfer.`,
    actionLabel: 'Plan Savings',
    actionRoute: '/ai-insights',
    priority: 'medium',
    createdAt: new Date().toISOString().split('T')[0],
    isRead: false,
  };
};

// ─── Engine Orchestrator ────────────────────────────────────────────────────

export const generateRecommendations = (ctx: RecommendationContext): AIInsight[] => {
  const {
    loans,
    monthlyIncome,
    creditScore,
    missedPayments,
    onTimePayments,
    monthlySavings,
    overdueCount,
  } = ctx;

  const totalEMI = loans.reduce((s, l) => s + l.emiAmount, 0);
  const overdueAmount = loans.filter((l) => l.status === 'overdue').reduce((s, l) => s + l.emiAmount, 0);

  const candidates: (AIInsight | null)[] = [
    overdueWarning(overdueCount, overdueAmount),
    dtiWarning(totalEMI, monthlyIncome),
    highestRateLoanRecommendation(loans),
    avalancheRecommendation(loans),
    snowballRecommendation(loans),
    refinanceOpportunity(loans),
    emergencyFundTip(monthlySavings * 12, totalEMI),
    paymentStreakAchievement(onTimePayments),
  ];

  return candidates
    .filter((r): r is AIInsight => r !== null)
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
};
