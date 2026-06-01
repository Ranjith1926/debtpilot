import { loanRepository } from '@/repositories/loan.repository';
import { notificationService } from './notification.service';
import { analyticsService } from './analytics.service';
import prisma from '@/lib/prisma';
import { differenceInDays } from 'date-fns';
import { EMI_REMINDER_DAYS } from '@/config/constants';

export class CronService {
  async runEmiReminders(): Promise<{ sent: number; errors: number }> {
    const now = new Date();
    const lookAhead = new Date(now);
    lookAhead.setDate(lookAhead.getDate() + Math.max(...EMI_REMINDER_DAYS));

    const loans = await prisma.loan.findMany({
      where: {
        status: 'ACTIVE',
        nextDueDate: { gte: now, lte: lookAhead },
      },
      include: { user: true },
    });

    let sent = 0;
    let errors = 0;

    for (const loan of loans) {
      try {
        if (!loan.nextDueDate) continue;
        const daysUntilDue = differenceInDays(loan.nextDueDate, now);

        if ((EMI_REMINDER_DAYS as readonly number[]).includes(daysUntilDue)) {
          await notificationService.sendEmiReminder(
            loan.userId,
            loan.lenderName,
            Number(loan.emiAmount),
            daysUntilDue,
          );
          sent++;
        }
      } catch {
        errors++;
      }
    }

    return { sent, errors };
  }

  async runOverdueDetection(): Promise<{ updated: number; notified: number }> {
    const overdueLoans = await loanRepository.findOverdueLoans();
    let updated = 0;
    let notified = 0;

    for (const loan of overdueLoans) {
      try {
        await loanRepository.update(loan.id, { status: 'OVERDUE' });
        updated++;

        await notificationService.sendEmiReminder(
          loan.userId,
          loan.lenderName,
          Number(loan.emiAmount),
          -1,
        );
        notified++;
      } catch {
        // Continue processing remaining loans
      }
    }

    return { updated, notified };
  }

  async runMonthlyAnalytics(): Promise<{ processed: number; errors: number }> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    let processed = 0;
    let errors = 0;

    for (const user of users) {
      try {
        await analyticsService.generateMonthlyAnalytics(user.id, month, year);
        processed++;
      } catch {
        errors++;
      }
    }

    return { processed, errors };
  }

  async runHealthRecalculation(): Promise<{ updated: number }> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    let updated = 0;

    for (const user of users) {
      try {
        await analyticsService.generateMonthlyAnalytics(user.id, month, year);
        updated++;
      } catch {
        // Continue processing
      }
    }

    return { updated };
  }
}

export const cronService = new CronService();
