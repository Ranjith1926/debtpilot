import { MockAPI } from '@api/mock.client';
import { PaymentHistory, PaymentSummary } from '@/types/payment.types';

export const PaymentService = {
  getHistory: async (): Promise<PaymentHistory[]> => {
    const res = await MockAPI.payments.getHistory();
    return res.data;
  },

  getByLoan: async (loanId: string): Promise<PaymentHistory[]> => {
    const res = await MockAPI.payments.getByLoan(loanId);
    return res.data;
  },

  getSummary: async (): Promise<PaymentSummary> => {
    const res = await MockAPI.analytics.getPaymentSummary();
    return res.data as PaymentSummary;
  },
};
