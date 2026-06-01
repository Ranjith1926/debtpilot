import type { NextRequest } from 'next/server';
import type { AuthenticatedUser } from '@/types';
import { loanService } from '@/services/loan.service';
import { validateBody, validateQuery } from '@/middleware/validate.middleware';
import { createLoanSchema, updateLoanSchema, loanQuerySchema } from '@/validations/loan.validation';
import {
  successResponse,
  createdResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/utils/response';
import { parsePaginationQuery, buildPaginationMeta } from '@/utils/pagination';
import type { LoanStatus } from '@prisma/client';

type AuthReq = NextRequest & { user: AuthenticatedUser };

export async function getLoansController(req: AuthReq) {
  const { searchParams } = new URL(req.url);
  const { data: query } = validateQuery(searchParams, loanQuerySchema);
  const { page, limit } = parsePaginationQuery(searchParams);

  try {
    const result = await loanService.getLoans(
      req.user.id,
      { status: query?.status as LoanStatus, loanType: query?.loanType },
      { page, limit },
    );
    const loans = (result as { loans: unknown[]; total: number }).loans;
    const total = (result as { loans: unknown[]; total: number }).total;
    return successResponse(loans, undefined, 200, buildPaginationMeta(total, page, limit));
  } catch {
    return serverErrorResponse();
  }
}

export async function createLoanController(req: AuthReq) {
  const { data, error } = await validateBody(req, createLoanSchema);
  if (error) return error;

  try {
    const loan = await loanService.createLoan(req.user.id, data);
    return createdResponse(loan, 'Loan added successfully');
  } catch (err) {
    return serverErrorResponse(err instanceof Error ? err.message : undefined);
  }
}

export async function getLoanByIdController(req: AuthReq, id: string) {
  try {
    const loan = await loanService.getLoanById(id, req.user.id);
    return successResponse(loan);
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('not found')) return notFoundResponse('Loan not found');
    return serverErrorResponse();
  }
}

export async function updateLoanController(req: AuthReq, id: string) {
  const { data, error } = await validateBody(req, updateLoanSchema);
  if (error) return error;

  try {
    const loan = await loanService.updateLoan(id, req.user.id, data);
    return successResponse(loan, 'Loan updated successfully');
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('not found')) return notFoundResponse('Loan not found');
    return serverErrorResponse();
  }
}

export async function deleteLoanController(req: AuthReq, id: string) {
  try {
    await loanService.deleteLoan(id, req.user.id);
    return successResponse(null, 'Loan deleted successfully');
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('not found')) return notFoundResponse('Loan not found');
    return serverErrorResponse();
  }
}
