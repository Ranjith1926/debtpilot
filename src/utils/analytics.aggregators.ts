import { Loan, EMI, LoanSummary } from '@/types/loan.types';
import { MonthlyData, LoanDistribution } from '@/types/analytics.types';
import { PaymentHistory } from '@/types/payment.types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const LOAN_COLORS: Record<string, string> = {
  home: '#7C3AED', car: '#06B6D4', personal: '#F59E0B',
  education: '#10B981', business: '#EF4444', gold: '#FBBF24', credit_card: '#EC4899',
};
const LOAN_LABELS: Record<string, string> = {
  home: 'Home Loan', car: 'Car Loan', personal: 'Personal Loan',
  education: 'Education Loan', business: 'Business Loan', gold: 'Gold Loan', credit_card: 'Credit Card',
};

export const aggregateLoanSummary = (loans: Loan[], emis: EMI[], monthlyIncome: number): LoanSummary => {
  const active = loans.filter((l) => l.status === 'active');
  const overdue = emis.filter((e) => e.status === 'overdue');
  const upcoming = [...emis].filter((e) => e.status !== 'paid').sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const next = upcoming[0];

  return {
    totalLoans: loans.length,
    activeLoans: active.length,
    totalOutstanding: active.reduce((s, l) => s + l.outstandingAmount, 0),
    totalEMIPerMonth: active.reduce((s, l) => s + l.emiAmount, 0),
    nextEMIDue: next?.dueDate ?? '',
    nextEMIAmount: next?.amount ?? 0,
    overdueAmount: overdue.reduce((s, e) => s + e.amount + e.penaltyAmount, 0),
    overdueCount: overdue.length,
    totalPaidThisYear: loans.reduce((s, l) => s + l.totalPaid, 0),
    debtToIncomeRatio: monthlyIncome > 0
      ? Math.round((active.reduce((s, l) => s + l.emiAmount, 0) / monthlyIncome) * 1000) / 10
      : 0,
  };
};

export const aggregateLoanDistribution = (loans: Loan[]): LoanDistribution[] => {
  const total = loans.reduce((s, l) => s + l.outstandingAmount, 0);
  const grouped: Record<string, number> = {};
  for (const l of loans) grouped[l.type] = (grouped[l.type] ?? 0) + l.outstandingAmount;
  return Object.entries(grouped)
    .map(([type, amount]) => ({
      type: LOAN_LABELS[type] ?? type,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 1000) / 10 : 0,
      color: LOAN_COLORS[type] ?? '#7C3AED',
    }))
    .sort((a, b) => b.amount - a.amount);
};

export const aggregateMonthlyData = (payments: PaymentHistory[], loans: Loan[]): MonthlyData[] => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthPayments = payments.filter((p) => {
      const pd = new Date(p.date);
      return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear() && p.status === 'success';
    });
    const totalPaid = monthPayments.reduce((s, p) => s + p.amount, 0);
    const totalInterest = loans.reduce((s, l) => s + l.outstandingAmount * (l.interestRate / 100 / 12), 0);
    const interestPaid = Math.min(totalPaid, Math.round(totalInterest));
    return {
      month: MONTHS[d.getMonth()],
      year: d.getFullYear(),
      totalPaid,
      principalPaid: Math.max(0, totalPaid - interestPaid),
      interestPaid,
      savingsAmount: 0,
    };
  });
};

export const buildEMICalendar = (emis: EMI[]): Record<string, EMI[]> => {
  const cal: Record<string, EMI[]> = {};
  for (const emi of emis) {
    const key = emi.dueDate.split('T')[0];
    (cal[key] ??= []).push(emi);
  }
  return cal;
};

export const calcPaymentStats = (payments: PaymentHistory[]) => {
  const now = new Date();
  const success = payments.filter((p) => p.status === 'success');
  return {
    totalPaid: success.reduce((s, p) => s + p.amount, 0),
    totalThisMonth: success
      .filter((p) => { const d = new Date(p.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
      .reduce((s, p) => s + p.amount, 0),
    totalThisYear: success
      .filter((p) => new Date(p.date).getFullYear() === now.getFullYear())
      .reduce((s, p) => s + p.amount, 0),
    successCount: success.length,
    failedCount: payments.filter((p) => p.status === 'failed').length,
    successRate: payments.length > 0 ? Math.round((success.length / payments.length) * 100) : 0,
  };
};
