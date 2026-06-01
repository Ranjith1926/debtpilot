import prisma from '@/lib/prisma';
import type { Loan, Prisma, LoanStatus } from '@prisma/client';
import { getPrismaSkipTake } from '@/utils/pagination';

export class LoanRepository {
  async create(userId: string, data: Omit<Prisma.LoanCreateInput, 'user'>): Promise<Loan> {
    return prisma.loan.create({
      data: { ...data, user: { connect: { id: userId } } },
    });
  }

  async findById(id: string): Promise<Loan | null> {
    return prisma.loan.findUnique({ where: { id } });
  }

  async findByIdAndUser(id: string, userId: string): Promise<Loan | null> {
    return prisma.loan.findFirst({ where: { id, userId } });
  }

  async findByUser(
    userId: string,
    filters: { status?: LoanStatus; loanType?: string } = {},
    pagination = { page: 1, limit: 20 },
  ): Promise<{ loans: Loan[]; total: number }> {
    const where: Prisma.LoanWhereInput = {
      userId,
      ...(filters.status && { status: filters.status }),
      ...(filters.loanType && { loanType: filters.loanType as import('@prisma/client').LoanType }),
    };
    const { skip, take } = getPrismaSkipTake(pagination.page, pagination.limit);

    const [loans, total] = await prisma.$transaction([
      prisma.loan.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.loan.count({ where }),
    ]);

    return { loans, total };
  }

  async findActiveByUser(userId: string): Promise<Loan[]> {
    return prisma.loan.findMany({
      where: { userId, status: 'ACTIVE' },
      orderBy: { nextDueDate: 'asc' },
    });
  }

  async findOverdueLoans(): Promise<Loan[]> {
    return prisma.loan.findMany({
      where: {
        status: 'ACTIVE',
        nextDueDate: { lt: new Date() },
      },
      include: { user: true },
    });
  }

  async findUpcomingDue(userId: string, days = 7): Promise<Loan[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    return prisma.loan.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        nextDueDate: { lte: cutoff },
      },
      orderBy: { nextDueDate: 'asc' },
    });
  }

  async update(id: string, data: Prisma.LoanUpdateInput): Promise<Loan> {
    return prisma.loan.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Loan> {
    return prisma.loan.delete({ where: { id } });
  }

  async sumActiveEmi(userId: string): Promise<number> {
    const result = await prisma.loan.aggregate({
      where: { userId, status: 'ACTIVE' },
      _sum: { emiAmount: true },
    });
    return Number(result._sum.emiAmount ?? 0);
  }

  async sumOutstandingBalance(userId: string): Promise<number> {
    const result = await prisma.loan.aggregate({
      where: { userId, status: 'ACTIVE' },
      _sum: { outstandingBalance: true },
    });
    return Number(result._sum.outstandingBalance ?? 0);
  }
}

export const loanRepository = new LoanRepository();
