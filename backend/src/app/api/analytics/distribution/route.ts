import type { NextRequest } from 'next/server';
import { withAuth } from '@/middleware/auth.middleware';
import { loanRepository } from '@/repositories/loan.repository';
import { successResponse, serverErrorResponse } from '@/utils/response';
import type { AuthenticatedUser } from '@/types';

type AuthReq = NextRequest & { user: AuthenticatedUser };

export const GET = withAuth(async (req: AuthReq) => {
  try {
    const { loans } = await loanRepository.findByUser(req.user.id, {}, { page: 1, limit: 1000 });

    const distribution: Record<string, { count: number; outstanding: number; emi: number }> = {};
    for (const loan of loans) {
      const key = loan.loanType;
      if (!distribution[key]) distribution[key] = { count: 0, outstanding: 0, emi: 0 };
      distribution[key].count++;
      distribution[key].outstanding += Number(loan.outstandingBalance);
      distribution[key].emi += Number(loan.emiAmount);
    }

    const result = Object.entries(distribution).map(([type, data]) => ({ type, ...data }));
    return successResponse(result);
  } catch {
    return serverErrorResponse();
  }
});
