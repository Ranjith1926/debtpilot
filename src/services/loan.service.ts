import { apiClient } from '@api/axios.client';
import { AddLoanPayload, Loan, LoanSummary } from '@/types/loan.types';
import { ENDPOINTS } from '@constants/endpoints';

const LOAN_TYPE_MAP: Record<string, string> = {
  home: 'HOME_LOAN',
  car: 'VEHICLE_LOAN',
  personal: 'PERSONAL_LOAN',
  education: 'EDUCATION_LOAN',
  business: 'BUSINESS_LOAN',
  gold: 'GOLD_LOAN',
  credit_card: 'CREDIT_CARD',
};

const LOAN_TYPE_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(LOAN_TYPE_MAP).map(([k, v]) => [v, k]),
);

function mapLoanFromApi(raw: Record<string, unknown>): Loan {
  return {
    id: raw.id as string,
    userId: raw.userId as string,
    lenderName: raw.lenderName as string,
    type: (LOAN_TYPE_REVERSE[raw.loanType as string] ?? raw.loanType) as Loan['type'],
    status: ((raw.status as string).toLowerCase()) as Loan['status'],
    principalAmount: Number(raw.totalAmount),
    outstandingAmount: Number(raw.outstandingBalance),
    interestRate: Number(raw.interestRate),
    tenureMonths: Number(raw.tenureMonths),
    startDate: (raw.disbursedAt as string) ?? new Date().toISOString(),
    endDate: raw.closureDate as string ?? '',
    emiAmount: Number(raw.emiAmount),
    emiDueDate: raw.dueDate as number,
    totalPaid: 0,
    totalInterestPaid: 0,
    nextEMIDate: (raw.nextDueDate as string) ?? '',
    accountNumber: (raw.accountNumber as string) ?? '',
    prepaymentAllowed: true,
    forecloseCharges: 0,
    lastPaymentDate: raw.lastPaymentDate as string | undefined,
    lastPaymentAmount: raw.lastPaymentAmount as number | undefined,
  };
}

export class LoanService {
  static async getLoans() {
    const response = await apiClient.get(ENDPOINTS.LOANS.LIST);
    const raw: Record<string, unknown>[] = response.data.data ?? [];
    return { data: raw.map(mapLoanFromApi) };
  }

  static async getLoanById(id: string): Promise<Loan> {
    const response = await apiClient.get(ENDPOINTS.LOANS.DETAIL(id));
    return mapLoanFromApi(response.data.data);
  }

  static async getLoanSummary(): Promise<LoanSummary> {
    const response = await apiClient.get('/analytics/dashboard');
    const d = response.data.data;
    return {
      totalLoans: d.totalLoans ?? 0,
      activeLoans: d.activeLoans ?? 0,
      totalOutstanding: d.totalOutstanding ?? 0,
      totalEMIPerMonth: d.monthlyEmi ?? 0,
      nextEMIDue: d.upcomingEmis?.[0]?.dueDate ?? '',
      nextEMIAmount: d.upcomingEmis?.[0]?.emiAmount ?? 0,
      overdueAmount: 0,
      overdueCount: d.upcomingEmis?.filter((e: Record<string, unknown>) => e.isOverdue)?.length ?? 0,
      totalPaidThisYear: 0,
      debtToIncomeRatio: d.debtToIncomeRatio ?? 0,
    };
  }

  static async addLoan(payload: AddLoanPayload): Promise<Loan> {
    const response = await apiClient.post(ENDPOINTS.LOANS.CREATE, {
      loanType: LOAN_TYPE_MAP[payload.type] ?? 'OTHER',
      lenderName: payload.lenderName,
      accountNumber: payload.accountNumber,
      totalAmount: payload.principalAmount,
      interestRate: payload.interestRate,
      tenureMonths: payload.tenureMonths,
      emiAmount: calculateEMI(payload.principalAmount, payload.interestRate, payload.tenureMonths),
      outstandingBalance: payload.principalAmount,
      disbursedAt: new Date(payload.startDate).toISOString(),
      dueDate: payload.emiDueDate,
    });
    return mapLoanFromApi(response.data.data);
  }

  static async getUpcomingEMIs() {
    const response = await apiClient.get(ENDPOINTS.EMIS.UPCOMING);
    const raw: Record<string, unknown>[] = response.data.data ?? [];
    const data: import('@/types/loan.types').EMI[] = raw.map((item, idx) => {
      const daysUntilDue = item.daysUntilDue as number ?? 0;
      const isOverdue = item.isOverdue as boolean ?? false;
      const dueDate = item.dueDate ? new Date(item.dueDate as string) : new Date();
      let status: import('@/types/loan.types').EMIStatus = 'upcoming';
      if (isOverdue) status = 'overdue';
      else if (daysUntilDue <= 3) status = 'pending';

      return {
        id: `${item.loanId}-${idx}`,
        loanId: item.loanId as string,
        loanName: item.lenderName as string,
        lenderName: item.lenderName as string,
        loanType: (LOAN_TYPE_REVERSE[item.loanType as string] ?? 'personal') as import('@/types/loan.types').LoanType,
        amount: Number(item.emiAmount),
        dueDate: dueDate.toISOString(),
        status,
        penaltyAmount: 0,
        month: dueDate.getMonth() + 1,
        year: dueDate.getFullYear(),
        installmentNumber: 1,
        totalInstallments: 1,
      };
    });
    return { data };
  }

  static async getEMIHistory() {
    const response = await apiClient.get(ENDPOINTS.EMIS.LIST);
    return { data: response.data.data ?? [] };
  }
}

function calculateEMI(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / months;
  return Math.round((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
}
