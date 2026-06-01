import { withAdminAuth } from '@/middleware/auth.middleware';
import { sendNotificationController } from '@/modules/notifications/notification.controller';

export const POST = withAdminAuth(sendNotificationController);
