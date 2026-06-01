import { z } from 'zod';

const LOAN_TYPES = ['HOME_LOAN', 'PERSONAL_LOAN', 'VEHICLE_LOAN', 'EDUCATION_LOAN', 'BUSINESS_LOAN', 'GOLD_LOAN', 'CREDIT_CARD', 'OTHER'] as const;
const LOAN_STATUSES = ['ACTIVE', 'CLOSED', 'OVERDUE', 'DEFAULTED', 'FORECLOSED'] as const;

export const createLoanSchema = z.object({
  loanType: z.enum(LOAN_TYPES),
  lenderName: z.string().min(2, 'Lender name must be at least 2 characters').max(200),
  accountNumber: z.string().max(50).optional(),
  totalAmount: z.number().positive('Total amount must be positive'),
  interestRate: z.number().min(0.01).max(100, 'Interest rate must be between 0.01 and 100'),
  tenureMonths: z.number().int().min(1).max(600, 'Tenure must be between 1 and 600 months'),
  emiAmount: z.number().positive('EMI amount must be positive'),
  outstandingBalance: z.number().min(0, 'Outstanding balance cannot be negative'),
  disbursedAt: z.string().datetime().optional(),
  dueDate: z.number().int().min(1).max(31, 'Due date must be between 1 and 31'),
  notes: z.string().max(500).optional(),
});

export const updateLoanSchema = createLoanSchema.partial().extend({
  status: z.enum(LOAN_STATUSES).optional(),
});

export const loanQuerySchema = z.object({
  status: z.enum(LOAN_STATUSES).optional(),
  loanType: z.enum(LOAN_TYPES).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type UpdateLoanInput = z.infer<typeof updateLoanSchema>;
