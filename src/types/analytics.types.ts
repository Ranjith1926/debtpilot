export interface MonthlyData {
  month: string;
  year: number;
  totalPaid: number;
  principalPaid: number;
  interestPaid: number;
  savingsAmount: number;
}

export interface LoanDistribution {
  type: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface SpendingInsight {
  id: string;
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

export interface FinancialHealthMetric {
  label: string;
  score: number;
  maxScore: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
  description: string;
}

export interface AIInsight {
  id: string;
  type: 'tip' | 'warning' | 'opportunity' | 'achievement';
  title: string;
  description: string;
  actionLabel?: string;
  actionRoute?: string;
  savingsEstimate?: number;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  isRead: boolean;
}

export interface Reminder {
  id: string;
  loanId: string;
  loanName: string;
  lenderName: string;
  emiAmount: number;
  dueDate: string;
  reminderDays: number[];
  isActive: boolean;
  notifyVia: ('push' | 'sms' | 'email')[];
}
