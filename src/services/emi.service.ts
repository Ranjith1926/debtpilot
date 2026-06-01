import { apiClient } from '@api/axios.client';
import { EMI } from '@/types/loan.types';
import { ENDPOINTS } from '@constants/endpoints';

function mapEmiFromApi(raw: Record<string, unknown>): EMI {
  return {
    id: (raw.loanId ?? raw.id) as string,
    loanId: raw.loanId as string,
    loanName: raw.lenderName as string,
    lenderName: raw.lenderName as string,
    loanType: raw.loanType as EMI['loanType'],
    amount: Number(raw.emiAmount ?? raw.amount),
    dueDate: (raw.dueDate ?? raw.nextDueDate) as string,
    status: (raw.isOverdue ? 'overdue' : raw.daysUntilDue === 0 ? 'pending' : 'upcoming') as EMI['status'],
    penaltyAmount: 0,
    month: new Date((raw.dueDate ?? raw.nextDueDate) as string).getMonth() + 1,
    year: new Date((raw.dueDate ?? raw.nextDueDate) as string).getFullYear(),
    installmentNumber: 0,
    totalInstallments: 0,
  };
}

export const EMIService = {
  getUpcoming: async (): Promise<EMI[]> => {
    const res = await apiClient.get(ENDPOINTS.EMIS.UPCOMING);
    return (res.data.data ?? []).map(mapEmiFromApi);
  },

  getHistory: async (): Promise<EMI[]> => {
    const res = await apiClient.get(ENDPOINTS.EMIS.LIST);
    return (res.data.data ?? []).map((item: Record<string, unknown>) => ({
      id: item.id as string,
      loanId: item.loanId as string,
      loanName: (item.loan as Record<string, unknown>)?.lenderName as string ?? '',
      lenderName: (item.loan as Record<string, unknown>)?.lenderName as string ?? '',
      loanType: (item.loan as Record<string, unknown>)?.loanType as EMI['loanType'],
      amount: Number(item.amount),
      dueDate: item.paymentDate as string,
      status: (item.status as string === 'SUCCESS' ? 'paid' : 'pending') as EMI['status'],
      paidDate: item.paymentDate as string,
      paidAmount: Number(item.amount),
      penaltyAmount: 0,
      month: new Date(item.paymentDate as string).getMonth() + 1,
      year: new Date(item.paymentDate as string).getFullYear(),
      installmentNumber: 0,
      totalInstallments: 0,
    }));
  },

  getByLoan: async (loanId: string): Promise<EMI[]> => {
    const res = await apiClient.get(ENDPOINTS.EMIS.LIST, { params: { loanId } });
    return (res.data.data ?? []).map(mapEmiFromApi);
  },

  markPaid: async (loanId: string, paidAmount: number, paymentMethod: string): Promise<EMI> => {
    const res = await apiClient.post(ENDPOINTS.EMIS.PAY, {
      loanId,
      amount: paidAmount,
      method: paymentMethod.toUpperCase(),
      paymentDate: new Date().toISOString(),
    });
    return mapEmiFromApi(res.data.data);
  },

  create: async (_payload: Partial<EMI>): Promise<EMI> => {
    throw new Error('EMIs are managed automatically by the backend based on loans.');
  },

  delete: async (_emiId: string): Promise<void> => {
    // EMIs are auto-managed; this is a no-op
  },

  detectAndFlagOverdue: async (): Promise<EMI[]> => {
    return EMIService.getOverdue();
  },

  getOverdue: async (): Promise<EMI[]> => {
    const emis = await EMIService.getUpcoming();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return emis.filter((e) => {
      const due = new Date(e.dueDate);
      return due < today && e.status !== 'paid';
    });
  },

  getDueSoon: async (days = 7): Promise<EMI[]> => {
    const emis = await EMIService.getUpcoming();
    const today = new Date();
    const cutoff = new Date(today.getTime() + days * 86400000);
    return emis.filter((e) => {
      const due = new Date(e.dueDate);
      return due >= today && due <= cutoff && e.status !== 'paid';
    });
  },
};
