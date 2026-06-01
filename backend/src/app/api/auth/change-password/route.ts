import type { NextRequest } from 'next/server';
import { withAuth } from '@/middleware/auth.middleware';
import { userRepository } from '@/repositories/user.repository';
import { successResponse, errorResponse, serverErrorResponse } from '@/utils/response';
import type { AuthenticatedUser } from '@/types';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const schema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
});

type AuthReq = NextRequest & { user: AuthenticatedUser };

export const POST = withAuth(async (req: AuthReq) => {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return errorResponse(result.error.errors[0].message, 422);
    }
    const { currentPassword, newPassword } = result.data;

    const user = await userRepository.findById(req.user.id);
    if (!user?.passwordHash) return errorResponse('Account uses social login', 400);

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return errorResponse('Current password is incorrect', 401);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await userRepository.update(req.user.id, { passwordHash } as any);

    return successResponse(null, 'Password changed successfully');
  } catch {
    return serverErrorResponse();
  }
});
