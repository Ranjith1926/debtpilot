import { withAuth } from '@/middleware/auth.middleware';
import { getDashboardController } from '@/modules/analytics/analytics.controller';

export const GET = withAuth(getDashboardController);
