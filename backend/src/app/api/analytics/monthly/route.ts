import { withAuth } from '@/middleware/auth.middleware';
import { getReportsController } from '@/modules/analytics/analytics.controller';

export const GET = withAuth(getReportsController);
