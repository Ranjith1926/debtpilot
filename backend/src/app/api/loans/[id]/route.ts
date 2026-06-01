import type { NextRequest } from 'next/server';
import { withAuth } from '@/middleware/auth.middleware';
import {
  getLoanByIdController,
  updateLoanController,
  deleteLoanController,
} from '@/modules/loans/loan.controller';
import type { AuthenticatedUser } from '@/types';

export const GET = withAuth(async (req: NextRequest & { user: AuthenticatedUser }, ctx?: { params: Record<string, string> }) => {
  return getLoanByIdController(req, ctx!.params.id);
});

export const PUT = withAuth(async (req: NextRequest & { user: AuthenticatedUser }, ctx?: { params: Record<string, string> }) => {
  return updateLoanController(req, ctx!.params.id);
});

export const DELETE = withAuth(async (req: NextRequest & { user: AuthenticatedUser }, ctx?: { params: Record<string, string> }) => {
  return deleteLoanController(req, ctx!.params.id);
});
