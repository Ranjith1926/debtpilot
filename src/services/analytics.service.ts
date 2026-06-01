import { apiClient } from '@api/axios.client';
import { ENDPOINTS } from '@constants/endpoints';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const LOAN_TYPE_COLORS: Record<string, string> = {
  HOME_LOAN: '#7C3AED',
  PERSONAL_LOAN: '#06B6D4',
  VEHICLE_LOAN: '#10B981',
  EDUCATION_LOAN: '#F59E0B',
  BUSINESS_LOAN: '#EF4444',
  GOLD_LOAN: '#FBBF24',
  CREDIT_CARD: '#EC4899',
  OTHER: '#6B7280',
};

const LOAN_TYPE_LABELS: Record<string, string> = {
  HOME_LOAN: 'Home Loan',
  PERSONAL_LOAN: 'Personal',
  VEHICLE_LOAN: 'Vehicle',
  EDUCATION_LOAN: 'Education',
  BUSINESS_LOAN: 'Business',
  GOLD_LOAN: 'Gold Loan',
  CREDIT_CARD: 'Credit Card',
  OTHER: 'Other',
};

export class AnalyticsService {
  static async getMonthlyData() {
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.MONTHLY);
    const { reports = [] } = response.data.data ?? {};
    return (reports as Record<string, unknown>[]).map((r) => ({
      month: MONTH_LABELS[(r.month as number) - 1] ?? String(r.month),
      totalPaid: Number(r.totalPaid ?? 0),
      interestPaid: Number(r.monthlyEmi ?? 0) * 0.4, // estimated interest portion
      principalPaid: Number(r.totalPaid ?? 0),
    }));
  }

  static async getLoanDistribution() {
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.DISTRIBUTION);
    const raw: Record<string, unknown>[] = response.data.data ?? [];
    const total = raw.reduce((sum, item) => sum + Number(item.outstanding ?? 0), 0);
    return raw.map((item) => ({
      type: LOAN_TYPE_LABELS[item.type as string] ?? String(item.type),
      amount: Number(item.outstanding ?? 0),
      percentage: total > 0 ? Math.round((Number(item.outstanding) / total) * 100) : 0,
      color: LOAN_TYPE_COLORS[item.type as string] ?? '#6B7280',
    }));
  }

  static async getInsights() {
    const response = await apiClient.get(ENDPOINTS.INSIGHTS.LIST);
    return response.data;
  }

  static async getReminders() {
    const response = await apiClient.get(ENDPOINTS.REMINDERS.LIST);
    return response.data;
  }

  static async getDashboard() {
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.OVERVIEW);
    return response.data.data;
  }
}
