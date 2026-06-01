import { withAuth } from '@/middleware/auth.middleware';
import { getLoansController, createLoanController } from '@/modules/loans/loan.controller';

export const GET = withAuth(getLoansController);
export const POST = withAuth(createLoanController);
