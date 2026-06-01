/**
 * Financial Health Score Engine
 * Score: 0–100  Bands: 0–39 Poor | 40–59 Average | 60–79 Good | 80–100 Excellent
 */

export interface HealthScoreInput {
  monthlyIncome: number;        // net take-home
  totalMonthlyEMI: number;      // sum of all active EMIs
  totalOutstanding: number;     // sum of all loan balances
  totalCreditLimit: number;     // sum of all credit card/LOC limits
  creditCardBalance: number;    // revolving credit used
  onTimePayments: number;       // count
  latePayments: number;         // count
  missedPayments: number;       // count
  monthlySavings: number;       // savings per month
  loanAgeMonths: number;        // average age of loans
  numberOfLoans: number;
}

export interface HealthScoreResult {
  total: number;                // 0–100
  band: 'excellent' | 'good' | 'average' | 'poor';
  label: string;
  color: string;
  gradient: string[];
  components: HealthComponent[];
  insights: string[];
  nextSteps: string[];
}

export interface HealthComponent {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  description: string;
  status: 'excellent' | 'good' | 'average' | 'poor';
}

// ─── Component Scorers ─────────────────────────────────────────────────────

const scoreEMIToIncome = (emi: number, income: number): { score: number; desc: string } => {
  if (income <= 0) return { score: 0, desc: 'Income data missing' };
  const ratio = emi / income;
  if (ratio <= 0.2) return { score: 30, desc: 'Excellent – EMI under 20% of income' };
  if (ratio <= 0.3) return { score: 24, desc: 'Good – EMI under 30% of income' };
  if (ratio <= 0.4) return { score: 18, desc: 'Average – EMI 30–40% of income' };
  if (ratio <= 0.5) return { score: 10, desc: 'High – EMI 40–50% of income' };
  return { score: 4, desc: 'Critical – EMI above 50% of income' };
};

const scorePaymentHistory = (onTime: number, late: number, missed: number): { score: number; desc: string } => {
  const total = onTime + late + missed;
  if (total === 0) return { score: 20, desc: 'No payment history yet' };
  const onTimeRate = onTime / total;
  if (onTimeRate === 1) return { score: 30, desc: 'Perfect payment record' };
  if (onTimeRate >= 0.95) return { score: 25, desc: 'Excellent – 95%+ on-time' };
  if (onTimeRate >= 0.85) return { score: 18, desc: 'Good – 85–95% on-time' };
  if (onTimeRate >= 0.7) return { score: 10, desc: 'Average – some late payments' };
  return { score: 3, desc: `Poor – ${missed} missed payments` };
};

const scoreCreditUtilization = (used: number, limit: number): { score: number; desc: string } => {
  if (limit <= 0) return { score: 20, desc: 'No revolving credit' };
  const ratio = used / limit;
  if (ratio <= 0.1) return { score: 20, desc: 'Excellent – under 10% utilization' };
  if (ratio <= 0.3) return { score: 16, desc: 'Good – under 30% utilization' };
  if (ratio <= 0.5) return { score: 10, desc: 'Moderate – 30–50% utilization' };
  if (ratio <= 0.75) return { score: 5, desc: 'High – 50–75% utilization' };
  return { score: 1, desc: 'Critical – over 75% utilization' };
};

const scoreSavingsRatio = (savings: number, income: number): { score: number; desc: string } => {
  if (income <= 0) return { score: 0, desc: 'Income data missing' };
  const ratio = savings / income;
  if (ratio >= 0.2) return { score: 10, desc: 'Excellent – saving 20%+ of income' };
  if (ratio >= 0.1) return { score: 8, desc: 'Good – saving 10–20% of income' };
  if (ratio >= 0.05) return { score: 5, desc: 'Average – saving 5–10% of income' };
  if (ratio > 0) return { score: 2, desc: 'Low savings rate' };
  return { score: 0, desc: 'No savings recorded' };
};

const scoreDebtConsistency = (loanAge: number, numLoans: number): { score: number; desc: string } => {
  const ageFactor = Math.min(loanAge / 60, 1); // max benefit at 5 years
  const diversityFactor = numLoans >= 2 && numLoans <= 4 ? 1 : numLoans === 1 ? 0.7 : 0.8;
  const score = Math.round(10 * ageFactor * diversityFactor);
  return { score, desc: `Loan age: ${loanAge} months, ${numLoans} active loan${numLoans !== 1 ? 's' : ''}` };
};

// ─── Main Score Calculator ─────────────────────────────────────────────────

export const computeHealthScore = (input: HealthScoreInput): HealthScoreResult => {
  const emi = scoreEMIToIncome(input.totalMonthlyEMI, input.monthlyIncome);
  const payments = scorePaymentHistory(input.onTimePayments, input.latePayments, input.missedPayments);
  const credit = scoreCreditUtilization(input.creditCardBalance, input.totalCreditLimit);
  const savings = scoreSavingsRatio(input.monthlySavings, input.monthlyIncome);
  const consistency = scoreDebtConsistency(input.loanAgeMonths, input.numberOfLoans);

  const components: HealthComponent[] = [
    {
      name: 'EMI to Income',
      score: emi.score,
      maxScore: 30,
      weight: 30,
      description: emi.desc,
      status: emi.score >= 24 ? 'excellent' : emi.score >= 18 ? 'good' : emi.score >= 10 ? 'average' : 'poor',
    },
    {
      name: 'Payment History',
      score: payments.score,
      maxScore: 30,
      weight: 30,
      description: payments.desc,
      status: payments.score >= 25 ? 'excellent' : payments.score >= 18 ? 'good' : payments.score >= 10 ? 'average' : 'poor',
    },
    {
      name: 'Credit Utilization',
      score: credit.score,
      maxScore: 20,
      weight: 20,
      description: credit.desc,
      status: credit.score >= 16 ? 'excellent' : credit.score >= 10 ? 'good' : credit.score >= 5 ? 'average' : 'poor',
    },
    {
      name: 'Savings Rate',
      score: savings.score,
      maxScore: 10,
      weight: 10,
      description: savings.desc,
      status: savings.score >= 8 ? 'excellent' : savings.score >= 5 ? 'good' : savings.score >= 2 ? 'average' : 'poor',
    },
    {
      name: 'Debt Consistency',
      score: consistency.score,
      maxScore: 10,
      weight: 10,
      description: consistency.desc,
      status: consistency.score >= 8 ? 'excellent' : consistency.score >= 6 ? 'good' : consistency.score >= 3 ? 'average' : 'poor',
    },
  ];

  const total = components.reduce((sum, c) => sum + c.score, 0);

  const getBand = (score: number): HealthScoreResult['band'] => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  };

  const band = getBand(total);

  const bandMeta = {
    excellent: { label: 'Excellent', color: '#10B981', gradient: ['#059669', '#10B981'] },
    good: { label: 'Good', color: '#06B6D4', gradient: ['#0891B2', '#06B6D4'] },
    average: { label: 'Needs Attention', color: '#F59E0B', gradient: ['#D97706', '#F59E0B'] },
    poor: { label: 'Critical', color: '#EF4444', gradient: ['#DC2626', '#EF4444'] },
  };

  const insights = generateInsights(input, components, total);
  const nextSteps = generateNextSteps(input, components);

  return {
    total,
    band,
    label: bandMeta[band].label,
    color: bandMeta[band].color,
    gradient: bandMeta[band].gradient,
    components,
    insights,
    nextSteps,
  };
};

const generateInsights = (input: HealthScoreInput, components: HealthComponent[], total: number): string[] => {
  const insights: string[] = [];
  const dti = input.totalMonthlyEMI / input.monthlyIncome;

  if (dti > 0.4) insights.push(`Your EMI-to-income ratio is ${Math.round(dti * 100)}% — above the safe 40% threshold.`);
  if (input.missedPayments > 0) insights.push(`${input.missedPayments} missed payment(s) significantly impact your score.`);
  if (input.creditCardBalance / input.totalCreditLimit > 0.5) {
    insights.push('Credit card utilization above 50% reduces your borrowing power.');
  }
  if (input.monthlySavings < input.monthlyIncome * 0.1) {
    insights.push('Consider building an emergency fund — aim for 10% monthly savings.');
  }
  if (total >= 80) insights.push('Your financial health is excellent. Keep maintaining discipline.');
  return insights;
};

const generateNextSteps = (input: HealthScoreInput, components: HealthComponent[]): string[] => {
  const steps: string[] = [];
  const worst = [...components].sort((a, b) => a.score / a.maxScore - b.score / b.maxScore)[0];

  if (worst.name === 'EMI to Income') steps.push('Reduce EMI burden by prepaying highest-rate loans.');
  if (worst.name === 'Payment History') steps.push('Set up auto-debit to never miss a payment.');
  if (worst.name === 'Credit Utilization') steps.push('Pay down credit card balances to below 30%.');
  if (worst.name === 'Savings Rate') steps.push('Automate ₹5,000/month transfer to savings after salary credit.');
  if (worst.name === 'Debt Consistency') steps.push('Maintain loan accounts for at least 2 years for better score.');

  steps.push('Review loans quarterly and prepay when possible.');
  return steps;
};
