import type { NextRequest } from 'next/server';
import type { AuthenticatedUser } from '@/types';
import { paymentService } from '@/services/payment.service';
import { loanService } from '@/services/loan.service';
import { validateBody, validateQuery } from '@/middleware/validate.middleware';
import { createPaymentSchema, paymentQuerySchema } from '@/validations/payment.validation';
import {
  successResponse,
  createdResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/utils/response';
import { parsePaginationQuery, buildPaginationMeta } from '@/utils/pagination';
import type { PaymentStatus } from '@prisma/client';

type AuthReq = NextRequest & { user: AuthenticatedUser };

export async function getEmisController(req: AuthReq) {
  const { searchParams } = new URL(req.url);
  const { data: query } = validateQuery(searchParams, paymentQuerySchema);
  const { page, limit } = parsePaginationQuery(searchParams);

  try {
    const { payments, total } = await paymentService.getPayments(
      req.user.id,
      {
        status: query?.status as PaymentStatus,
        from: query?.from,
        to: query?.to,
      },
      { page, limit },
    );
    return successResponse(payments, undefined, 200, buildPaginationMeta(total, page, limit));
  } catch {
    return serverErrorResponse();
  }
}

export async function payEmiController(req: AuthReq) {
  const { data, error } = await validateBody(req, createPaymentSchema);
  if (error) return error;

  try {
    const payment = await paymentService.recordPayment(req.user.id, data);
    return createdResponse(payment, 'Payment recorded successfully');
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('not found')) return notFoundResponse('Loan not found');
    return serverErrorResponse(message || undefined);
  }
}

export async function getUpcomingEmisController(req: AuthReq) {
  try {
    const upcomingEmis = await loanService.getUpcomingEmis(req.user.id, 30);
    return successResponse(upcomingEmis, 'Upcoming EMIs retrieved');
  } catch {
    return serverErrorResponse();
  }
}
