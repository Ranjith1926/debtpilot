import type { NextRequest } from 'next/server';
import { withAuth } from '@/middleware/auth.middleware';
import { userRepository } from '@/repositories/user.repository';
import { validateBody } from '@/middleware/validate.middleware';
import { updateProfileSchema } from '@/validations/auth.validation';
import { successResponse, notFoundResponse, serverErrorResponse } from '@/utils/response';
import { cacheDel } from '@/lib/redis';
import { CACHE_KEYS } from '@/config/constants';
import type { AuthenticatedUser } from '@/types';

type AuthReq = NextRequest & { user: AuthenticatedUser };

export const GET = withAuth(async (req: AuthReq) => {
  try {
    const user = await userRepository.findById(req.user.id);
    if (!user) return notFoundResponse('User not found');

    const { passwordHash, ...safe } = user as typeof user & { passwordHash?: string };
    void passwordHash;
    return successResponse(safe);
  } catch {
    return serverErrorResponse();
  }
});

export const PUT = withAuth(async (req: AuthReq) => {
  const { data, error } = await validateBody(req, updateProfileSchema);
  if (error) return error;

  try {
    const updated = await userRepository.update(req.user.id, data);
    await cacheDel(CACHE_KEYS.USER(req.user.id), CACHE_KEYS.DASHBOARD(req.user.id));
    const { passwordHash, ...safe } = updated as typeof updated & { passwordHash?: string };
    void passwordHash;
    return successResponse(safe, 'Profile updated');
  } catch {
    return serverErrorResponse();
  }
});
