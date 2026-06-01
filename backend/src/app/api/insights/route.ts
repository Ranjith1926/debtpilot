import type { NextRequest } from 'next/server';
import { withAuth } from '@/middleware/auth.middleware';
import { analyticsService } from '@/services/analytics.service';
import { successResponse, serverErrorResponse } from '@/utils/response';
import type { AuthenticatedUser } from '@/types';

type AuthReq = NextRequest & { user: AuthenticatedUser };

export const GET = withAuth(async (req: AuthReq) => {
  try {
    const dashboard = await analyticsService.getDashboard(req.user.id);
    const insights = generateInsights(dashboard as unknown as { healthScore: number; debtToIncomeRatio?: number; upcomingEmis?: { daysUntilDue: number }[] });
    return successResponse(insights);
  } catch {
    return serverErrorResponse();
  }
});

function generateInsights(dashboard: { healthScore: number; debtToIncomeRatio?: number; upcomingEmis?: { daysUntilDue: number }[] }) {
  const insights = [];

  if ((dashboard.healthScore as number) < 60) {
    insights.push({
      id: 'health-low',
      type: 'warning',
      title: 'Financial Health Needs Attention',
      description: `Your health score is ${dashboard.healthScore}/100. Consider reducing your EMI burden.`,
      priority: 'high',
      createdAt: new Date().toISOString(),
      isRead: false,
    });
  }

  if ((dashboard.debtToIncomeRatio as number) > 0.4) {
    insights.push({
      id: 'dti-high',
      type: 'warning',
      title: 'High Debt-to-Income Ratio',
      description: `Your EMIs consume ${Math.round((dashboard.debtToIncomeRatio as number) * 100)}% of your income. The ideal is below 40%.`,
      priority: 'high',
      createdAt: new Date().toISOString(),
      isRead: false,
    });
  }

  const upcoming = dashboard.upcomingEmis as { daysUntilDue: number }[];
  if (upcoming?.some((e) => e.daysUntilDue <= 3)) {
    insights.push({
      id: 'emi-due-soon',
      type: 'tip',
      title: 'EMI Due Soon',
      description: 'You have an EMI due within 3 days. Make sure your account has sufficient balance.',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      isRead: false,
    });
  }

  return insights;
}
