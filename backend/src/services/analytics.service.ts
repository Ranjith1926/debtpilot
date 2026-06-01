import prisma from '@/lib/prisma';
import { loanRepository } from '@/repositories/loan.repository';
import { paymentRepository } from '@/repositories/payment.repository';
import { userRepository } from '@/repositories/user.repository';
import { cacheGet, cacheSet } from '@/lib/redis';
import { CACHE_KEYS, CACHE_TTL, HEALTH_SCORE } from '@/config/constants';
import type { DashboardData } from '@/types';
import { loanService } from './loan.service';

export class AnalyticsService {
  async getDashboard(userId: string): Promise<DashboardData> {
    const cached = await cacheGet<DashboardData>(CACHE_KEYS.DASHBOARD(userId));
    if (cached) return cached;

    const [user, activeLoans, allLoans] = await Promise.all([
      userRepository.findById(userId),
      loanRepository.findActiveByUser(userId),
      loanRepository.findByUser(userId, {}, { page: 1, limit: 1000 }),
    ]);

    const monthlyEmi = activeLoans.reduce((sum, l) => sum + Number(l.emiAmount), 0);
    const totalOutstanding = activeLoans.reduce((sum, l) => sum + Number(l.outstandingBalance), 0);
    const monthlyIncome = Number(user?.monthlyIncome ?? 0);

    const healthScore = this.calculateHealthScore({
      monthlyEmi,
      monthlyIncome,
      overdueCount: activeLoans.filter((l) => l.status === 'OVERDUE').length,
      activeLoansCount: activeLoans.length,
    });

    const upcomingEmis = await loanService.getUpcomingEmis(userId, 7);

    const recentPayments = await prisma.payment.findMany({
      where: { loan: { userId }, status: 'SUCCESS' },
      orderBy: { paymentDate: 'desc' },
      take: 5,
      include: { loan: { select: { lenderName: true } } },
    });

    const dashboard: DashboardData = {
      totalLoans: allLoans.total,
      activeLoans: activeLoans.length,
      totalOutstanding,
      monthlyEmi,
      healthScore,
      healthLabel: this.getHealthLabel(healthScore),
      upcomingEmis,
      recentPayments,
      debtToIncomeRatio: monthlyIncome > 0 ? monthlyEmi / monthlyIncome : undefined,
    };

    await cacheSet(CACHE_KEYS.DASHBOARD(userId), dashboard, CACHE_TTL.SHORT);
    return dashboard;
  }

  async generateMonthlyAnalytics(userId: string, month: number, year: number) {
    const cacheKey = CACHE_KEYS.ANALYTICS(userId, month, year);
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const [user, activeLoans] = await Promise.all([
      userRepository.findById(userId),
      loanRepository.findActiveByUser(userId),
    ]);

    const monthlyEmi = activeLoans.reduce((sum, l) => sum + Number(l.emiAmount), 0);
    const totalOutstanding = activeLoans.reduce((sum, l) => sum + Number(l.outstandingBalance), 0);
    const totalPaid = await paymentRepository.sumPaidByUser(userId, month, year);
    const monthlyIncome = Number(user?.monthlyIncome ?? 0);

    const healthScore = this.calculateHealthScore({
      monthlyEmi,
      monthlyIncome,
      overdueCount: activeLoans.filter((l) => l.status === 'OVERDUE').length,
      activeLoansCount: activeLoans.length,
    });

    const analytics = await prisma.analytics.upsert({
      where: { userId_month_year: { userId, month, year } },
      create: {
        userId,
        month,
        year,
        totalLoans: activeLoans.length,
        activeLoans: activeLoans.length,
        monthlyEmi,
        totalOutstanding,
        totalPaid,
        healthScore,
        debtToIncome: monthlyIncome > 0 ? monthlyEmi / monthlyIncome : null,
      },
      update: {
        monthlyEmi,
        totalOutstanding,
        totalPaid,
        healthScore,
        activeLoans: activeLoans.length,
        debtToIncome: monthlyIncome > 0 ? monthlyEmi / monthlyIncome : null,
      },
    });

    await cacheSet(cacheKey, analytics, CACHE_TTL.LONG);
    return analytics;
  }

  async getReports(userId: string, months = 6) {
    const now = new Date();
    const records = [];

    for (let i = 0; i < months; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();

      const record = await prisma.analytics.findUnique({
        where: { userId_month_year: { userId, month, year } },
      });

      if (record) records.push(record);
    }

    return records.reverse();
  }

  calculateHealthScore(params: {
    monthlyEmi: number;
    monthlyIncome: number;
    overdueCount: number;
    activeLoansCount: number;
  }): number {
    let score = HEALTH_SCORE.MAX;

    if (params.monthlyIncome > 0) {
      const dti = params.monthlyEmi / params.monthlyIncome;
      if (dti > 0.5) score -= 40;
      else if (dti > 0.4) score -= 25;
      else if (dti > 0.3) score -= 10;
    }

    score -= params.overdueCount * 15;
    if (params.activeLoansCount > 5) score -= 10;
    else if (params.activeLoansCount > 3) score -= 5;

    return Math.max(0, Math.min(HEALTH_SCORE.MAX, score));
  }

  private getHealthLabel(score: number): string {
    if (score >= HEALTH_SCORE.THRESHOLDS.EXCELLENT) return HEALTH_SCORE.LABELS.EXCELLENT;
    if (score >= HEALTH_SCORE.THRESHOLDS.GOOD) return HEALTH_SCORE.LABELS.GOOD;
    if (score >= HEALTH_SCORE.THRESHOLDS.FAIR) return HEALTH_SCORE.LABELS.FAIR;
    return HEALTH_SCORE.LABELS.POOR;
  }
}

export const analyticsService = new AnalyticsService();
