import { loanRepository } from '@/repositories/loan.repository';
import { cacheGet, cacheSet, cacheDel } from '@/lib/redis';
import { CACHE_KEYS, CACHE_TTL } from '@/config/constants';
import type { CreateLoanInput, UpdateLoanInput, UpcomingEmi } from '@/types';
import type { LoanStatus } from '@prisma/client';
import { differenceInDays, setDate, addMonths } from 'date-fns';

export class LoanService {
  async createLoan(userId: string, input: CreateLoanInput) {
    const nextDueDate = this.calculateNextDueDate(input.dueDate);

    const loan = await loanRepository.create(userId, {
      loanType: input.loanType,
      lenderName: input.lenderName,
      accountNumber: input.accountNumber,
      totalAmount: input.totalAmount,
      interestRate: input.interestRate,
      tenureMonths: input.tenureMonths,
      emiAmount: input.emiAmount,
      outstandingBalance: input.outstandingBalance,
      disbursedAt: input.disbursedAt ? new Date(input.disbursedAt) : undefined,
      dueDate: input.dueDate,
      nextDueDate,
      notes: input.notes,
    });

    await cacheDel(CACHE_KEYS.USER_LOANS(userId), CACHE_KEYS.DASHBOARD(userId), CACHE_KEYS.UPCOMING_EMIS(userId));
    return loan;
  }

  async getLoans(
    userId: string,
    filters: { status?: LoanStatus; loanType?: string } = {},
    pagination = { page: 1, limit: 20 },
  ) {
    if (!filters.status && !filters.loanType && pagination.page === 1) {
      const cached = await cacheGet(CACHE_KEYS.USER_LOANS(userId));
      if (cached) return cached;
    }

    const result = await loanRepository.findByUser(userId, filters, pagination);

    if (!filters.status && !filters.loanType && pagination.page === 1) {
      await cacheSet(CACHE_KEYS.USER_LOANS(userId), result, CACHE_TTL.SHORT);
    }

    return result;
  }

  async getLoanById(id: string, userId: string) {
    const cached = await cacheGet(CACHE_KEYS.LOAN(id));
    if (cached) return cached;

    const loan = await loanRepository.findByIdAndUser(id, userId);
    if (!loan) throw new Error('Loan not found');

    await cacheSet(CACHE_KEYS.LOAN(id), loan, CACHE_TTL.MEDIUM);
    return loan;
  }

  async updateLoan(id: string, userId: string, input: UpdateLoanInput) {
    const existing = await loanRepository.findByIdAndUser(id, userId);
    if (!existing) throw new Error('Loan not found');

    const updateData: Record<string, unknown> = { ...input };
    if (input.dueDate) {
      updateData.nextDueDate = this.calculateNextDueDate(input.dueDate);
    }

    const loan = await loanRepository.update(id, updateData);

    await cacheDel(
      CACHE_KEYS.LOAN(id),
      CACHE_KEYS.USER_LOANS(userId),
      CACHE_KEYS.DASHBOARD(userId),
      CACHE_KEYS.UPCOMING_EMIS(userId),
    );

    return loan;
  }

  async deleteLoan(id: string, userId: string): Promise<void> {
    const existing = await loanRepository.findByIdAndUser(id, userId);
    if (!existing) throw new Error('Loan not found');

    await loanRepository.delete(id);

    await cacheDel(
      CACHE_KEYS.LOAN(id),
      CACHE_KEYS.USER_LOANS(userId),
      CACHE_KEYS.DASHBOARD(userId),
    );
  }

  async getUpcomingEmis(userId: string, days = 30): Promise<UpcomingEmi[]> {
    const cached = await cacheGet<UpcomingEmi[]>(CACHE_KEYS.UPCOMING_EMIS(userId));
    if (cached) return cached;

    const loans = await loanRepository.findUpcomingDue(userId, days);
    const now = new Date();

    const upcomingEmis: UpcomingEmi[] = loans.map((loan) => {
      const dueDate = loan.nextDueDate ?? new Date();
      const daysUntilDue = differenceInDays(dueDate, now);
      return {
        loanId: loan.id,
        lenderName: loan.lenderName,
        loanType: loan.loanType,
        emiAmount: Number(loan.emiAmount),
        dueDate,
        daysUntilDue,
        isOverdue: daysUntilDue < 0,
      };
    });

    await cacheSet(CACHE_KEYS.UPCOMING_EMIS(userId), upcomingEmis, CACHE_TTL.SHORT);
    return upcomingEmis;
  }

  private calculateNextDueDate(dueDay: number): Date {
    const now = new Date();
    let next = setDate(now, dueDay);
    if (next <= now) next = addMonths(next, 1);
    return next;
  }
}

export const loanService = new LoanService();
