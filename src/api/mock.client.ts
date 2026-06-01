import { ApiResponse, PaginatedResponse } from '@/types/api.types';
import {
  DUMMY_LOANS,
  DUMMY_UPCOMING_EMIS,
  DUMMY_EMI_HISTORY,
  DUMMY_LOAN_SUMMARY,
  DUMMY_MONTHLY_DATA,
  DUMMY_LOAN_DISTRIBUTION,
  DUMMY_AI_INSIGHTS,
  DUMMY_USER,
  DUMMY_REMINDERS,
  DUMMY_PAYMENT_HISTORY,
  DUMMY_FINANCIAL_HEALTH,
  DUMMY_RECOMMENDATIONS,
  DUMMY_NOTIFICATIONS,
} from '@constants/dummy-data';
import { Loan } from '@/types/loan.types';
import { EMI } from '@/types/loan.types';
import { Reminder } from '@/types/analytics.types';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const mockResponse = <T>(data: T, message = 'Success'): ApiResponse<T> => ({
  data,
  message,
  success: true,
  statusCode: 200,
});

const mockPaginatedResponse = <T>(data: T[], page = 1, limit = 20): PaginatedResponse<T> => ({
  data,
  total: data.length,
  page,
  limit,
  totalPages: Math.ceil(data.length / limit),
  hasNext: false,
  hasPrev: false,
});

// In-memory mutable state for mock CRUD
let _loans = [...DUMMY_LOANS];
let _upcomingEMIs = [...DUMMY_UPCOMING_EMIS];
let _emiHistory = [...DUMMY_EMI_HISTORY];
let _reminders = [...DUMMY_REMINDERS];
let _payments = [...DUMMY_PAYMENT_HISTORY];
let _notifications = [...DUMMY_NOTIFICATIONS];
let _insights = [...DUMMY_AI_INSIGHTS];

export const MockAPI = {
  auth: {
    login: async (_phone: string, _password: string) => {
      await delay(1200);
      return mockResponse({ user: DUMMY_USER, accessToken: 'mock_access_token_jwt', refreshToken: 'mock_refresh_token_jwt' });
    },
    register: async () => { await delay(1500); return mockResponse({ message: 'OTP sent to registered phone' }); },
    verifyOTP: async () => {
      await delay(1000);
      return mockResponse({ user: DUMMY_USER, accessToken: 'mock_access_token_jwt', refreshToken: 'mock_refresh_token_jwt' });
    },
    getMe: async () => { await delay(500); return mockResponse(DUMMY_USER); },
    refreshToken: async () => {
      await delay(300);
      return mockResponse({ accessToken: 'mock_access_token_jwt_refreshed', refreshToken: 'mock_refresh_token_jwt' });
    },
    socialLogin: async (provider: string) => {
      await delay(1000);
      return mockResponse({ user: { ...DUMMY_USER, name: `${provider} User` }, accessToken: 'mock_social_token', refreshToken: 'mock_refresh' });
    },
  },

  loans: {
    getAll: async () => { await delay(800); return mockPaginatedResponse(_loans); },
    getById: async (id: string) => {
      await delay(600);
      const loan = _loans.find((l) => l.id === id);
      if (!loan) throw new Error('Loan not found');
      return mockResponse(loan);
    },
    getSummary: async () => {
      await delay(700);
      const totalOutstanding = _loans.reduce((s, l) => s + l.outstandingAmount, 0);
      const totalEMIPerMonth = _loans.reduce((s, l) => s + l.emiAmount, 0);
      const overdue = _upcomingEMIs.filter((e) => e.status === 'overdue');
      return mockResponse({
        ...DUMMY_LOAN_SUMMARY,
        totalLoans: _loans.length,
        activeLoans: _loans.filter((l) => l.status === 'active').length,
        totalOutstanding,
        totalEMIPerMonth,
        overdueAmount: overdue.reduce((s, e) => s + e.amount + e.penaltyAmount, 0),
        overdueCount: overdue.length,
      });
    },
    create: async (payload: unknown) => {
      await delay(1000);
      const newLoan = { ...(payload as Partial<Loan>), id: `loan_${Date.now()}`, status: 'active', userId: 'usr_001', totalPaid: 0, totalInterestPaid: 0 } as Loan;
      _loans.push(newLoan);
      return mockResponse(newLoan);
    },
    update: async (id: string, payload: Partial<Loan>) => {
      await delay(800);
      const idx = _loans.findIndex((l) => l.id === id);
      if (idx === -1) throw new Error('Loan not found');
      _loans[idx] = { ..._loans[idx], ...payload };
      return mockResponse(_loans[idx]);
    },
    delete: async (id: string) => {
      await delay(600);
      _loans = _loans.filter((l) => l.id !== id);
      return mockResponse({ success: true });
    },
    getAmortization: async (id: string) => {
      await delay(900);
      const loan = _loans.find((l) => l.id === id);
      if (!loan) throw new Error('Loan not found');
      const { generateAmortization } = await import('@constants/dummy-data');
      return mockResponse(generateAmortization(loan));
    },
  },

  emis: {
    getUpcoming: async () => { await delay(600); return mockPaginatedResponse(_upcomingEMIs); },
    getHistory: async () => { await delay(800); return mockPaginatedResponse(_emiHistory); },
    getByLoan: async (loanId: string) => {
      await delay(600);
      const all = [..._upcomingEMIs, ..._emiHistory].filter((e) => e.loanId === loanId);
      return mockPaginatedResponse(all);
    },
    markPaid: async (emiId: string, paidAmount: number, paymentMethod: string) => {
      await delay(1000);
      const idx = _upcomingEMIs.findIndex((e) => e.id === emiId);
      if (idx === -1) throw new Error('EMI not found');
      const emi = {
        ..._upcomingEMIs[idx],
        status: 'paid' as const,
        paidDate: new Date().toISOString().split('T')[0],
        paidAmount,
        paymentMethod: paymentMethod as EMI['paymentMethod'],
        receiptNumber: `RCP${Date.now()}`,
      };
      _upcomingEMIs.splice(idx, 1);
      _emiHistory.unshift(emi);
      const loan = _loans.find((l) => l.id === emi.loanId);
      if (loan) {
        loan.outstandingAmount = Math.max(0, loan.outstandingAmount - paidAmount);
        loan.totalPaid += paidAmount;
        loan.lastPaymentDate = emi.paidDate;
        loan.lastPaymentAmount = paidAmount;
      }
      const payment = { id: `pmt_${Date.now()}`, loanId: emi.loanId, emiId, amount: paidAmount, date: emi.paidDate!, method: paymentMethod as 'upi', status: 'success' as const, receiptNumber: emi.receiptNumber };
      _payments.unshift(payment);
      return mockResponse(emi);
    },
    create: async (payload: Partial<EMI>) => {
      await delay(800);
      const newEMI = { ...payload, id: `emi_${Date.now()}`, status: 'pending', penaltyAmount: 0 } as EMI;
      _upcomingEMIs.push(newEMI);
      return mockResponse(newEMI);
    },
    delete: async (emiId: string) => {
      await delay(500);
      _upcomingEMIs = _upcomingEMIs.filter((e) => e.id !== emiId);
      return mockResponse({ success: true });
    },
    detectOverdue: async () => {
      await delay(400);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      _upcomingEMIs = _upcomingEMIs.map((e) => {
        const due = new Date(e.dueDate);
        if (due < today && e.status !== 'paid') {
          return { ...e, status: 'overdue' as const, penaltyAmount: e.penaltyAmount + 500 };
        }
        return e;
      });
      return mockResponse(_upcomingEMIs);
    },
  },

  analytics: {
    getMonthly: async () => { await delay(700); return mockResponse(DUMMY_MONTHLY_DATA); },
    getDistribution: async () => { await delay(600); return mockResponse(DUMMY_LOAN_DISTRIBUTION); },
    getHealthScore: async () => { await delay(900); return mockResponse(DUMMY_FINANCIAL_HEALTH); },
    getRecommendations: async () => { await delay(1000); return mockPaginatedResponse(DUMMY_RECOMMENDATIONS); },
    getPaymentSummary: async () => {
      await delay(600);
      const success = _payments.filter((p) => p.status === 'success');
      return mockResponse({
        totalPaidThisMonth: success.filter((p) => new Date(p.date).getMonth() === new Date().getMonth()).reduce((s, p) => s + p.amount, 0),
        totalPaidThisYear: success.filter((p) => new Date(p.date).getFullYear() === new Date().getFullYear()).reduce((s, p) => s + p.amount, 0),
        successfulPayments: success.length,
        failedPayments: _payments.filter((p) => p.status === 'failed').length,
        avgMonthlyPayment: DUMMY_LOAN_SUMMARY.totalEMIPerMonth,
      });
    },
  },

  insights: {
    getAll: async () => { await delay(800); return mockPaginatedResponse(_insights); },
    markRead: async (insightId: string) => {
      await delay(300);
      const i = _insights.find((x) => x.id === insightId);
      if (i) i.isRead = true;
      return mockResponse({ success: true });
    },
    markAllRead: async () => {
      await delay(400);
      _insights = _insights.map((i) => ({ ...i, isRead: true }));
      return mockResponse({ success: true });
    },
  },

  reminders: {
    getAll: async () => { await delay(600); return mockPaginatedResponse(_reminders); },
    create: async (payload: Partial<Reminder>) => {
      await delay(700);
      const newReminder = { ...payload, id: `rem_${Date.now()}`, isActive: true } as Reminder;
      _reminders.push(newReminder);
      return mockResponse(newReminder);
    },
    update: async (id: string, payload: Partial<Reminder>) => {
      await delay(500);
      const idx = _reminders.findIndex((r) => r.id === id);
      if (idx !== -1) _reminders[idx] = { ..._reminders[idx], ...payload };
      return mockResponse(_reminders[idx] || payload);
    },
    delete: async (id: string) => {
      await delay(400);
      _reminders = _reminders.filter((r) => r.id !== id);
      return mockResponse({ success: true });
    },
  },

  notifications: {
    getAll: async () => { await delay(500); return mockPaginatedResponse(_notifications); },
    markRead: async (id: string) => {
      await delay(300);
      const n = _notifications.find((x) => x.id === id);
      if (n) n.isRead = true;
      return mockResponse({ success: true });
    },
    markAllRead: async () => {
      await delay(400);
      _notifications = _notifications.map((n) => ({ ...n, isRead: true }));
      return mockResponse({ success: true });
    },
    getUnreadCount: async () => {
      await delay(200);
      return mockResponse({ count: _notifications.filter((n) => !n.isRead).length });
    },
  },

  payments: {
    getHistory: async () => { await delay(700); return mockPaginatedResponse(_payments); },
    getByLoan: async (loanId: string) => {
      await delay(600);
      return mockPaginatedResponse(_payments.filter((p) => p.loanId === loanId));
    },
  },
};
