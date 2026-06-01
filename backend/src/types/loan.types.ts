import type { LoanType, LoanStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

export interface CreateLoanInput {
  loanType: LoanType;
  lenderName: string;
  accountNumber?: string;
  totalAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  outstandingBalance: number;
  disbursedAt?: string;
  dueDate: number;
  notes?: string;
}

export interface UpdateLoanInput extends Partial<CreateLoanInput> {
  status?: LoanStatus;
}

export interface CreatePaymentInput {
  loanId: string;
  amount: number;
  principalPaid?: number;
  interestPaid?: number;
  paymentDate: string;
  method?: PaymentMethod;
  transactionId?: string;
  notes?: string;
}

export interface LoanWithPayments {
  id: string;
  loanType: LoanType;
  lenderName: string;
  totalAmount: number;
  emiAmount: number;
  outstandingBalance: number;
  dueDate: number;
  nextDueDate: Date | null;
  status: LoanStatus;
  payments: PaymentSummary[];
}

export interface PaymentSummary {
  id: string;
  amount: number;
  paymentDate: Date;
  status: PaymentStatus;
  method: PaymentMethod;
}

export interface UpcomingEmi {
  loanId: string;
  lenderName: string;
  loanType: LoanType;
  emiAmount: number;
  dueDate: Date;
  daysUntilDue: number;
  isOverdue: boolean;
}
