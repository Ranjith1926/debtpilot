import type { NextRequest } from 'next/server';
import { authService } from '@/services/auth.service';
import { validateBody } from '@/middleware/validate.middleware';
import { rateLimit } from '@/middleware/rateLimit.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  firebaseAuthSchema,
} from '@/validations/auth.validation';
import {
  successResponse,
  createdResponse,
  errorResponse,
  serverErrorResponse,
} from '@/utils/response';

export async function registerController(req: NextRequest) {
  const limited = await rateLimit(req, { max: 10, keyPrefix: 'register' });
  if (limited) return limited;

  const { data, error } = await validateBody(req, registerSchema);
  if (error) return error;

  try {
    const result = await authService.register(data);
    return createdResponse(result, 'Account created successfully');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    if (message.includes('already')) return errorResponse(message, 409);
    return serverErrorResponse(message);
  }
}

export async function loginController(req: NextRequest) {
  const limited = await rateLimit(req, { max: 20, keyPrefix: 'login' });
  if (limited) return limited;

  const { data, error } = await validateBody(req, loginSchema);
  if (error) return error;

  try {
    const result = await authService.login(data);
    return successResponse(result, 'Login successful');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return errorResponse(message, 401);
  }
}

export async function firebaseLoginController(req: NextRequest) {
  const limited = await rateLimit(req, { max: 20, keyPrefix: 'firebase_auth' });
  if (limited) return limited;

  const { data, error } = await validateBody(req, firebaseAuthSchema);
  if (error) return error;

  try {
    const result = await authService.loginWithFirebase(data);
    return successResponse(result, 'Authentication successful');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Firebase authentication failed';
    return errorResponse(message, 401);
  }
}

export async function refreshController(req: NextRequest) {
  const { data, error } = await validateBody(req, refreshTokenSchema);
  if (error) return error;

  try {
    const tokens = await authService.refresh(data.refreshToken);
    return successResponse(tokens, 'Token refreshed');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Token refresh failed';
    return errorResponse(message, 401);
  }
}

export async function logoutController(req: NextRequest & { user: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const refreshToken = body?.refreshToken ?? '';
    await authService.logout(req.user.id, refreshToken);
    return successResponse(null, 'Logged out successfully');
  } catch {
    return serverErrorResponse('Logout failed');
  }
}
