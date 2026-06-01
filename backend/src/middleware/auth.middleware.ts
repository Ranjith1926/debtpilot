import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/jwt';
import { unauthorizedResponse, forbiddenResponse } from '@/utils/response';
import type { AuthenticatedUser } from '@/types';

export type RouteHandler = (
  req: NextRequest & { user: AuthenticatedUser },
  context?: { params: Record<string, string> },
) => Promise<NextResponse>;

export function withAuth(handler: RouteHandler, requiredRole?: string) {
  return async (req: NextRequest, context?: { params: Record<string, string> }) => {
    try {
      const token = extractTokenFromHeader(req.headers.get('authorization'));
      if (!token) return unauthorizedResponse('Missing authentication token');

      const payload = verifyAccessToken(token);

      if (requiredRole && payload.role !== requiredRole && payload.role !== 'ADMIN') {
        return forbiddenResponse('Insufficient permissions');
      }

      const authenticatedReq = req as NextRequest & { user: AuthenticatedUser };
      authenticatedReq.user = {
        id: payload.sub,
        email: payload.email,
        name: '',
        role: payload.role,
      };

      return handler(authenticatedReq, context);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid token';
      if (message.includes('expired')) return unauthorizedResponse('Token has expired');
      return unauthorizedResponse('Invalid authentication token');
    }
  };
}

export function withAdminAuth(handler: RouteHandler) {
  return withAuth(handler, 'ADMIN');
}
