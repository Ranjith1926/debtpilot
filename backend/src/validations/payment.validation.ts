import { z } from 'zod';

const PAYMENT_METHODS = ['UPI', 'NETBANKING', 'DEBIT_CARD', 'CREDIT_CARD', 'NEFT', 'RTGS', 'CASH'] as const;

export const createPaymentSchema = z.object({
  loanId: z.string().cuid('Invalid loan ID'),
  amount: z.number().positive('Payment amount must be positive'),
  principalPaid: z.number().min(0).optional(),
  interestPaid: z.number().min(0).optional(),
  paymentDate: z.string().datetime(),
  method: z.enum(PAYMENT_METHODS).default('UPI'),
  transactionId: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export const paymentQuerySchema = z.object({
  loanId: z.string().cuid().optional(),
  status: z.enum(['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
