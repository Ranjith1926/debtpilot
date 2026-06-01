import { withAuth } from '@/middleware/auth.middleware';
import { getEmisController } from '@/modules/payments/payment.controller';

export const GET = withAuth(getEmisController);
