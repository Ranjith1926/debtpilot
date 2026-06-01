import { withAuth } from '@/middleware/auth.middleware';
import { markAllReadController } from '@/modules/notifications/notification.controller';

export const PATCH = withAuth(markAllReadController);
export const PUT = withAuth(markAllReadController);
