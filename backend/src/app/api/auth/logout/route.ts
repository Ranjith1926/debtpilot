import type { NextRequest } from 'next/server';
import { withAuth } from '@/middleware/auth.middleware';
import { logoutController } from '@/modules/auth/auth.controller';

export const POST = withAuth(async (req) => {
  return logoutController(req as NextRequest & { user: { id: string } });
});
