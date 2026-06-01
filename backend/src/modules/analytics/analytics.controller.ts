import type { NextRequest } from 'next/server';
import type { AuthenticatedUser } from '@/types';
import { analyticsService } from '@/services/analytics.service';
import { successResponse, serverErrorResponse } from '@/utils/response';

type AuthReq = NextRequest & { user: AuthenticatedUser };

export async function getDashboardController(req: AuthReq) {
  try {
    const dashboard = await analyticsService.getDashboard(req.user.id);
    return successResponse(dashboard, 'Dashboard data retrieved');
  } catch {
    return serverErrorResponse();
  }
}

export async function getReportsController(req: AuthReq) {
  const { searchParams } = new URL(req.url);
  const months = Math.min(24, Math.max(1, parseInt(searchParams.get('months') || '6', 10)));

  try {
    const [reports, currentMonth] = await Promise.all([
      analyticsService.getReports(req.user.id, months),
      analyticsService.generateMonthlyAnalytics(
        req.user.id,
        new Date().getMonth() + 1,
        new Date().getFullYear(),
      ),
    ]);

    return successResponse({ reports, currentMonth }, 'Reports retrieved');
  } catch {
    return serverErrorResponse();
  }
}
