import { withAuth } from '@/middleware/auth.middleware';
import { getUpcomingEmisController } from '@/modules/payments/payment.controller';

export const GET = withAuth(getUpcomingEmisController);
