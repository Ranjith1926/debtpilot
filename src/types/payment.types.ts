export type PaymentStatus = 'success' | 'failed' | 'pending' | 'refunded';
export type PaymentMethod = 'upi' | 'netbanking' | 'debit_card' | 'auto_debit';

export interface Payment {
  id: string;
  loanId: string;
  emiId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  status: PaymentStatus;
  receiptNumber?: string;
  transactionId?: string;
  bankRef?: string;
  note?: string;
}

export interface PaymentHistory {
  id: string;
  loanId: string;
  emiId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  status: PaymentStatus;
  receiptNumber?: string;
}

export interface MakePaymentPayload {
  loanId: string;
  emiId: string;
  amount: number;
  method: PaymentMethod;
}

export interface PaymentSummary {
  totalPaidThisMonth: number;
  totalPaidThisYear: number;
  successfulPayments: number;
  failedPayments: number;
  avgMonthlyPayment: number;
}
