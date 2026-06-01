import { paymentRepository } from '@/repositories/payment.repository';
import { loanRepository } from '@/repositories/loan.repository';
import { notificationService } from './notification.service';
import { cacheDel } from '@/lib/redis';
import { CACHE_KEYS } from '@/config/constants';
import type { CreatePaymentInput } from '@/types';
import type { PaymentStatus } from '@prisma/client';
import { addMonths, setDate } from 'date-fns';

export class PaymentService {
  async recordPayment(userId: string, input: CreatePaymentInput) {
    const loan = await loanRepository.findByIdAndUser(input.loanId, userId);
    if (!loan) throw new Error('Loan not found');

    const payment = await paymentRepository.create({
      loan: { connect: { id: input.loanId } },
      amount: input.amount,
      principalPaid: input.principalPaid ?? 0,
      interestPaid: input.interestPaid ?? 0,
      paymentDate: new Date(input.paymentDate),
      method: input.method ?? 'UPI',
      status: 'SUCCESS',
      transactionId: input.transactionId,
      notes: input.notes,
    });

    const newBalance = Math.max(0, Number(loan.outstandingBalance) - (input.principalPaid ?? input.amount));
    const nextDueDate = addMonths(setDate(new Date(), loan.dueDate), 1);

    await loanRepository.update(input.loanId, {
      outstandingBalance: newBalance,
      nextDueDate,
      status: newBalance <= 0 ? 'CLOSED' : 'ACTIVE',
    });

    await cacheDel(
      CACHE_KEYS.LOAN(input.loanId),
      CACHE_KEYS.USER_LOANS(userId),
      CACHE_KEYS.DASHBOARD(userId),
      CACHE_KEYS.UPCOMING_EMIS(userId),
    );

    await notificationService.sendPaymentConfirmation(userId, {
      amount: input.amount,
      lenderName: loan.lenderName,
      transactionId: input.transactionId,
    });

    return payment;
  }

  async getPayments(
    userId: string,
    filters: { status?: PaymentStatus; from?: string; to?: string } = {},
    pagination = { page: 1, limit: 20 },
  ) {
    return paymentRepository.findByUser(
      userId,
      {
        status: filters.status,
        from: filters.from ? new Date(filters.from) : undefined,
        to: filters.to ? new Date(filters.to) : undefined,
      },
      pagination,
    );
  }

  async getLoanPayments(loanId: string, userId: string, pagination = { page: 1, limit: 20 }) {
    const loan = await loanRepository.findByIdAndUser(loanId, userId);
    if (!loan) throw new Error('Loan not found');
    return paymentRepository.findByLoan(loanId, pagination);
  }
}

export const paymentService = new PaymentService();
