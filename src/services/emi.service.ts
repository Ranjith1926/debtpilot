import { MockAPI } from '@api/mock.client';
import { EMI } from '@/types/loan.types';

export const EMIService = {
  getUpcoming: async (): Promise<EMI[]> => {
    const res = await MockAPI.emis.getUpcoming();
    return res.data;
  },

  getHistory: async (): Promise<EMI[]> => {
    const res = await MockAPI.emis.getHistory();
    return res.data;
  },

  getByLoan: async (loanId: string): Promise<EMI[]> => {
    const res = await MockAPI.emis.getByLoan(loanId);
    return res.data;
  },

  markPaid: async (emiId: string, paidAmount: number, paymentMethod: string): Promise<EMI> => {
    const res = await MockAPI.emis.markPaid(emiId, paidAmount, paymentMethod);
    return res.data as EMI;
  },

  create: async (payload: Partial<EMI>): Promise<EMI> => {
    const res = await MockAPI.emis.create(payload);
    return res.data as EMI;
  },

  delete: async (emiId: string): Promise<void> => {
    await MockAPI.emis.delete(emiId);
  },

  detectAndFlagOverdue: async (): Promise<EMI[]> => {
    const res = await MockAPI.emis.detectOverdue();
    return res.data as EMI[];
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
