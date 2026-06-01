import { apiClient } from '@api/axios.client';
import { PaymentHistory, PaymentSummary } from '@/types/payment.types';
import { ENDPOINTS } from '@constants/endpoints';

function mapPaymentFromApi(raw: Record<string, unknown>): PaymentHistory {
  return {
    id: raw.id as string,
    loanId: raw.loanId as string,
    emiId: raw.id as string,
    amount: Number(raw.amount),
    date: raw.paymentDate as string,
    method: ((raw.method as string)?.toLowerCase() ?? 'upi') as PaymentHistory['method'],
    status: ((raw.status as string)?.toLowerCase() ?? 'success') as PaymentHistory['status'],
    transactionId: raw.transactionId as string | undefined,
  };
}

export const PaymentService = {
  getHistory: async (): Promise<PaymentHistory[]> => {
    const res = await apiClient.get(ENDPOINTS.EMIS.LIST);
    return (res.data.data ?? []).map(mapPaymentFromApi);
  },

  getByLoan: async (loanId: string): Promise<PaymentHistory[]> => {
    const res = await apiClient.get(ENDPOINTS.EMIS.LIST, { params: { loanId } });
    return (res.data.data ?? []).map(mapPaymentFromApi);
  },

  getSummary: async (): Promise<PaymentSummary> => {
    const res = await apiClient.get(ENDPOINTS.ANALYTICS.OVERVIEW);
    const d = res.data.data ?? {};
    return {
      totalPaid: d.totalPaid ?? 0,
      thisMonth: d.monthlyEmi ?? 0,
      thisYear: d.totalPaidThisYear ?? 0,
      lastPayment: d.recentPayments?.[0]?.amount ?? 0,
      lastPaymentDate: d.recentPayments?.[0]?.paymentDate ?? '',
    } as PaymentSummary;
  },
};
