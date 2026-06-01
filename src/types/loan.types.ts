export type LoanType = 'home' | 'car' | 'personal' | 'education' | 'business' | 'gold' | 'credit_card';
export type LoanStatus = 'active' | 'closed' | 'overdue' | 'foreclosed';
export type EMIStatus = 'pending' | 'paid' | 'overdue' | 'upcoming';
export type PaymentMethod = 'upi' | 'netbanking' | 'debit_card' | 'auto_debit';

export interface Loan {
  id: string;
  userId: string;
  lenderName: string;
  lenderLogo?: string;
  type: LoanType;
  status: LoanStatus;
  principalAmount: number;
  outstandingAmount: number;
  interestRate: number;
  tenureMonths: number;
  startDate: string;
  endDate: string;
  emiAmount: number;
  emiDueDate: number;
  totalPaid: number;
  totalInterestPaid: number;
  nextEMIDate: string;
  accountNumber: string;
  prepaymentAllowed: boolean;
  forecloseCharges: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
}

export interface EMI {
  id: string;
  loanId: string;
  loanName: string;
  lenderName: string;
  lenderLogo?: string;
  loanType: LoanType;
  amount: number;
  dueDate: string;
  status: EMIStatus;
  paidDate?: string;
  paidAmount?: number;
  penaltyAmount: number;
  paymentMethod?: PaymentMethod;
  receiptNumber?: string;
  month: number;
  year: number;
  installmentNumber: number;
  totalInstallments: number;
}

export interface LoanSummary {
  totalLoans: number;
  activeLoans: number;
  totalOutstanding: number;
  totalEMIPerMonth: number;
  nextEMIDue: string;
  nextEMIAmount: number;
  overdueAmount: number;
  overdueCount: number;
  totalPaidThisYear: number;
  debtToIncomeRatio: number;
}

export interface AmortizationEntry {
  installmentNumber: number;
  date: string;
  emiAmount: number;
  principalComponent: number;
  interestComponent: number;
  outstandingPrincipal: number;
  status: EMIStatus;
}

export interface AddLoanPayload {
  lenderName: string;
  type: LoanType;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  startDate: string;
  emiDueDate: number;
  accountNumber?: string;
  prepaymentAllowed?: boolean;
}
