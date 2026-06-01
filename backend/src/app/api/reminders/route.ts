import type { NextRequest } from 'next/server';
import { withAuth } from '@/middleware/auth.middleware';
import { loanRepository } from '@/repositories/loan.repository';
import { successResponse, serverErrorResponse } from '@/utils/response';
import type { AuthenticatedUser } from '@/types';

type AuthReq = NextRequest & { user: AuthenticatedUser };

export const GET = withAuth(async (req: AuthReq) => {
  try {
    const loans = await loanRepository.findActiveByUser(req.user.id);

    const reminders = loans.map((loan) => ({
      id: loan.id,
      loanId: loan.id,
      loanName: loan.lenderName,
      lenderName: loan.lenderName,
      emiAmount: Number(loan.emiAmount),
      dueDate: loan.nextDueDate?.toISOString() ?? '',
      reminderDays: [1, 3, 7],
      isActive: true,
      notifyVia: ['push'],
    }));

    return successResponse(reminders);
  } catch {
    return serverErrorResponse();
  }
});
