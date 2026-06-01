import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number').optional(),
  firebaseToken: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const firebaseAuthSchema = z.object({
  idToken: z.string().min(1, 'Firebase ID token is required'),
  deviceToken: z.string().optional(),
  platform: z.enum(['ios', 'android', 'web']).optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/).optional(),
  language: z.string().length(2).optional(),
  theme: z.enum(['LIGHT', 'DARK', 'SYSTEM']).optional(),
  monthlyIncome: z.number().positive().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type FirebaseAuthInput = z.infer<typeof firebaseAuthSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
