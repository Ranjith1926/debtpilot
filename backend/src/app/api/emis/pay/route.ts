import { withAuth } from '@/middleware/auth.middleware';
import { payEmiController } from '@/modules/payments/payment.controller';

export const POST = withAuth(payEmiController);
