import type { NextRequest } from 'next/server';
import { withAuth } from '@/middleware/auth.middleware';
import { analyticsService } from '@/services/analytics.service';
import { successResponse, serverErrorResponse } from '@/utils/response';
import type { AuthenticatedUser } from '@/types';

type AuthReq = NextRequest & { user: AuthenticatedUser };

export const GET = withAuth(async (req: AuthReq) => {
  try {
    const dashboard = await analyticsService.getDashboard(req.user.id);
    return successResponse({
      healthScore: dashboard.healthScore,
      healthLabel: dashboard.healthLabel,
      debtToIncomeRatio: dashboard.debtToIncomeRatio,
      monthlyEmi: dashboard.monthlyEmi,
      totalOutstanding: dashboard.totalOutstanding,
    });
  } catch {
    return serverErrorResponse();
  }
});
