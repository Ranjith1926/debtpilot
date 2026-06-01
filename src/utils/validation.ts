import { z } from 'zod';

export const phoneSchema = z
  .string()
  .min(10, 'Phone number must be 10 digits')
  .max(13, 'Invalid phone number')
  .regex(/^(\+91)?[6-9]\d{9}$/, 'Enter a valid Indian phone number');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Must contain at least one number');

export const otpSchema = z
  .string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only digits');

export const loginSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  email: z.string().email('Enter a valid email address'),
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const addLoanSchema = z.object({
  lenderName: z.string().min(2, 'Lender name is required'),
  type: z.enum(['home', 'car', 'personal', 'education', 'business', 'gold', 'credit_card']),
  principalAmount: z.number().min(1000, 'Minimum loan amount is ₹1,000').max(100000000, 'Amount too large'),
  interestRate: z.number().min(0.1, 'Interest rate too low').max(50, 'Interest rate too high'),
  tenureMonths: z.number().min(1, 'Minimum 1 month').max(360, 'Maximum 30 years'),
  startDate: z.string().min(1, 'Start date is required'),
  emiDueDate: z.number().min(1).max(31),
  accountNumber: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type AddLoanFormData = z.infer<typeof addLoanSchema>;
