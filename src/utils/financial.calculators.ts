import { Loan } from '@/types/loan.types';

export interface EMIBreakdown {
  emi: number;
  totalPayable: number;
  totalInterest: number;
  interestPercentage: number;
}

// ─── Core EMI Formula: P * r * (1+r)^n / ((1+r)^n - 1) ─────────────────────
export const calcEMI = (principal: number, annualRate: number, tenureMonths: number): number => {
  if (annualRate === 0) return Math.round(principal / tenureMonths);
  const r = annualRate / 100 / 12;
  return Math.round((principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1));
};

export const calcEMIBreakdown = (principal: number, annualRate: number, tenureMonths: number): EMIBreakdown => {
  const emi = calcEMI(principal, annualRate, tenureMonths);
  const totalPayable = emi * tenureMonths;
  const totalInterest = totalPayable - principal;
  return { emi, totalPayable, totalInterest, interestPercentage: Math.round((totalInterest / totalPayable) * 100) };
};

export const calcTotalInterest = (emi: number, tenureMonths: number, principal: number): number =>
  Math.round(emi * tenureMonths - principal);

export const calcRemainingInterest = (loan: Loan): number => {
  const r = loan.interestRate / 100 / 12;
  let outstanding = loan.outstandingAmount;
  let totalInterest = 0;
  let iterations = 0;
  while (outstanding > 1 && iterations < 1200) {
    const interest = outstanding * r;
    const principal = Math.min(loan.emiAmount - interest, outstanding);
    if (principal <= 0) break;
    totalInterest += interest;
    outstanding -= principal;
    iterations++;
  }
  return Math.round(totalInterest);
};

export const calcRemainingTenure = (loan: Loan): number => {
  const r = loan.interestRate / 100 / 12;
  if (r === 0) return Math.ceil(loan.outstandingAmount / loan.emiAmount);
  return Math.ceil(-Math.log(1 - (loan.outstandingAmount * r) / loan.emiAmount) / Math.log(1 + r));
};

// ─── Pre-closure Savings ──────────────────────────────────────────────────────
export const calcPreClosureSavings = (loan: Loan) => {
  const remainingInterest = calcRemainingInterest(loan);
  const chargeAmount = Math.round((loan.outstandingAmount * loan.forecloseCharges) / 100);
  const netSavings = Math.max(0, remainingInterest - chargeAmount);
  const totalPayable = loan.outstandingAmount + chargeAmount;
  return { interestSaved: remainingInterest, netSavings, chargeAmount, totalPayable };
};

// ─── Part Prepayment ─────────────────────────────────────────────────────────
export const calcPrepaymentImpact = (loan: Loan, prepayAmount: number, option: 'reduce_emi' | 'reduce_tenure' = 'reduce_tenure') => {
  const newOutstanding = Math.max(0, loan.outstandingAmount - prepayAmount);
  const r = loan.interestRate / 100 / 12;
  const remainingMonths = calcRemainingTenure(loan);

  if (option === 'reduce_emi') {
    const newEMI = calcEMI(newOutstanding, loan.interestRate, remainingMonths);
    const oldInterest = calcRemainingInterest(loan);
    const newInterest = calcTotalInterest(newEMI, remainingMonths, newOutstanding);
    return { newEMI, newTenure: remainingMonths, interestSaved: Math.max(0, oldInterest - newInterest) };
  }

  const newTenure = r > 0
    ? Math.ceil(-Math.log(1 - (newOutstanding * r) / loan.emiAmount) / Math.log(1 + r))
    : Math.ceil(newOutstanding / loan.emiAmount);
  const oldInterest = calcRemainingInterest(loan);
  const newInterest = calcTotalInterest(loan.emiAmount, newTenure, newOutstanding);
  return { newEMI: loan.emiAmount, newTenure, interestSaved: Math.max(0, oldInterest - newInterest) };
};

// ─── Avalanche & Snowball ─────────────────────────────────────────────────────
export const calcAvalancheSavings = (loans: Loan[], monthlyExtra: number): number => {
  const sorted = [...loans].filter((l) => l.status === 'active').sort((a, b) => b.interestRate - a.interestRate);
  let totalSavings = 0;
  let extra = monthlyExtra;
  for (const loan of sorted) {
    const r = loan.interestRate / 100 / 12;
    const normalInterest = calcRemainingInterest(loan);
    const newPayment = loan.emiAmount + extra;
    if (newPayment > loan.emiAmount && r > 0) {
      const newTenure = Math.ceil(-Math.log(1 - (loan.outstandingAmount * r) / newPayment) / Math.log(1 + r));
      const newInterest = calcTotalInterest(newPayment, newTenure, loan.outstandingAmount);
      totalSavings += Math.max(0, normalInterest - newInterest);
    }
    extra += loan.emiAmount;
  }
  return Math.round(totalSavings);
};

export const calcSnowballSavings = (loans: Loan[], monthlyExtra: number): number =>
  Math.round(calcAvalancheSavings(loans, monthlyExtra) * 0.65);

// ─── Affordability ────────────────────────────────────────────────────────────
export const getEMIAffordability = (monthlyEMI: number, monthlyIncome: number) => {
  const ratio = monthlyIncome > 0 ? (monthlyEMI / monthlyIncome) * 100 : 100;
  if (ratio <= 30) return { status: 'comfortable', label: 'Comfortable', color: '#10B981', ratio };
  if (ratio <= 40) return { status: 'manageable', label: 'Manageable', color: '#F59E0B', ratio };
  if (ratio <= 60) return { status: 'stretched', label: 'Stretched', color: '#EF4444', ratio };
  return { status: 'critical', label: 'Critical', color: '#DC2626', ratio };
};

// ─── Health Score ─────────────────────────────────────────────────────────────
export const computeFinancialHealthScore = (params: {
  totalMonthlyEMI: number;
  monthlyIncome: number;
  overdueCount: number;
  creditUtilizationPct: number;
  savingsRatioPct: number;
}): number => {
  const emiRatio = params.monthlyIncome > 0 ? (params.totalMonthlyEMI / params.monthlyIncome) * 100 : 100;
  const emiScore = Math.max(0, Math.round(100 - emiRatio));
  const paymentScore = Math.max(0, 100 - params.overdueCount * 20);
  const creditScore = params.creditUtilizationPct < 30 ? 90 : params.creditUtilizationPct < 50 ? 60 : 30;
  const savingsScore = Math.min(100, Math.round((params.savingsRatioPct / 20) * 100));
  return Math.round(emiScore * 0.35 + paymentScore * 0.30 + creditScore * 0.20 + savingsScore * 0.15);
};

// ─── Format INR ───────────────────────────────────────────────────────────────
export const formatINR = (amount: number, compact = false): string => {
  if (compact && Math.abs(amount) >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (compact && Math.abs(amount) >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (compact && Math.abs(amount) >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const calcDebtFreeDate = (loans: Loan[]): Date =>
  loans.reduce((latest, l) => {
    const end = new Date(l.endDate);
    return end > latest ? end : latest;
  }, new Date());

// ─── Backward-compat aliases (used by existing code) ─────────────────────────
export const calculateEMI = calcEMI;
export const getEMIBreakdown = calcEMIBreakdown;
export const calculatePrepaymentImpact = calcPrepaymentImpact;
export const snowballStrategy = (loans: Loan[], extra: number) => ({ savings: calcSnowballSavings(loans, extra), order: [...loans].sort((a, b) => a.outstandingAmount - b.outstandingAmount) });
export const avalancheStrategy = (loans: Loan[], extra: number) => ({ savings: calcAvalancheSavings(loans, extra), order: [...loans].sort((a, b) => b.interestRate - a.interestRate) });
export const generateAmortization = (loan: Loan) => {
  const entries = [];
  const r = loan.interestRate / 100 / 12;
  let outstanding = loan.principalAmount;
  for (let i = 1; i <= loan.tenureMonths; i++) {
    const interest = outstanding * r;
    const principal = Math.min(loan.emiAmount - interest, outstanding);
    outstanding = Math.max(0, outstanding - principal);
    const date = new Date(loan.startDate);
    date.setMonth(date.getMonth() + i - 1);
    const now = new Date();
    const isPast = date < now;
    const isCurrent = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    entries.push({ installmentNumber: i, date: date.toISOString().split('T')[0], emiAmount: loan.emiAmount, principalComponent: Math.max(0, principal), interestComponent: Math.max(0, interest), outstandingPrincipal: outstanding, status: isPast ? 'paid' : isCurrent ? 'upcoming' : 'pending' });
  }
  return entries;
};
