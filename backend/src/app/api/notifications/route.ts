import { withAuth } from '@/middleware/auth.middleware';
import {
  getNotificationsController,
  markAllReadController,
  registerDeviceTokenController,
} from '@/modules/notifications/notification.controller';

export const GET = withAuth(getNotificationsController);
export const PATCH = withAuth(markAllReadController);
export const POST = withAuth(registerDeviceTokenController);
