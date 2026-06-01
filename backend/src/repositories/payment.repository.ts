import prisma from '@/lib/prisma';
import type { Payment, Prisma, PaymentStatus } from '@prisma/client';
import { getPrismaSkipTake } from '@/utils/pagination';

export class PaymentRepository {
  async create(data: Prisma.PaymentCreateInput): Promise<Payment> {
    return prisma.payment.create({ data });
  }

  async findById(id: string): Promise<Payment | null> {
    return prisma.payment.findUnique({ where: { id } });
  }

  async findByLoan(
    loanId: string,
    pagination = { page: 1, limit: 20 },
  ): Promise<{ payments: Payment[]; total: number }> {
    const where: Prisma.PaymentWhereInput = { loanId };
    const { skip, take } = getPrismaSkipTake(pagination.page, pagination.limit);

    const [payments, total] = await prisma.$transaction([
      prisma.payment.findMany({ where, skip, take, orderBy: { paymentDate: 'desc' } }),
      prisma.payment.count({ where }),
    ]);

    return { payments, total };
  }

  async findByUser(
    userId: string,
    filters: { status?: PaymentStatus; from?: Date; to?: Date } = {},
    pagination = { page: 1, limit: 20 },
  ): Promise<{ payments: (Payment & { loan: { lenderName: string; loanType: string } })[]; total: number }> {
    const where: Prisma.PaymentWhereInput = {
      loan: { userId },
      ...(filters.status && { status: filters.status }),
      ...(filters.from || filters.to
        ? { paymentDate: { gte: filters.from, lte: filters.to } }
        : {}),
    };
    const { skip, take } = getPrismaSkipTake(pagination.page, pagination.limit);

    const [payments, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy: { paymentDate: 'desc' },
        include: { loan: { select: { lenderName: true, loanType: true } } },
      }),
      prisma.payment.count({ where }),
    ]);

    return { payments, total };
  }

  async sumPaidByLoan(loanId: string): Promise<number> {
    const result = await prisma.payment.aggregate({
      where: { loanId, status: 'SUCCESS' },
      _sum: { amount: true },
    });
    return Number(result._sum.amount ?? 0);
  }

  async sumPaidByUser(userId: string, month: number, year: number): Promise<number> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const result = await prisma.payment.aggregate({
      where: {
        loan: { userId },
        status: 'SUCCESS',
        paymentDate: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });
    return Number(result._sum.amount ?? 0);
  }

  async update(id: string, data: Prisma.PaymentUpdateInput): Promise<Payment> {
    return prisma.payment.update({ where: { id }, data });
  }
}

export const paymentRepository = new PaymentRepository();
