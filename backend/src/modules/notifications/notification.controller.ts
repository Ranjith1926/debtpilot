import type { NextRequest } from 'next/server';
import { z } from 'zod';
import type { AuthenticatedUser } from '@/types';
import { notificationService } from '@/services/notification.service';
import { validateBody } from '@/middleware/validate.middleware';
import { successResponse, serverErrorResponse } from '@/utils/response';
import { parsePaginationQuery, buildPaginationMeta } from '@/utils/pagination';

type AuthReq = NextRequest & { user: AuthenticatedUser };

const sendNotificationSchema = z.object({
  userId: z.string().cuid(),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  type: z.enum(['EMI_REMINDER', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'OVERDUE_ALERT', 'HEALTH_SCORE_UPDATE', 'SYSTEM']),
  data: z.record(z.string()).optional(),
});

const deviceTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['ios', 'android', 'web']),
});

export async function getNotificationsController(req: AuthReq) {
  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get('unread') === 'true';
  const { page, limit } = parsePaginationQuery(searchParams);

  try {
    const { notifications, total, unreadCount } = await notificationService.getNotifications(
      req.user.id,
      unreadOnly,
      { page, limit },
    );
    return successResponse(
      { notifications, unreadCount },
      undefined,
      200,
      buildPaginationMeta(total, page, limit),
    );
  } catch {
    return serverErrorResponse();
  }
}

export async function sendNotificationController(req: AuthReq) {
  const { data, error } = await validateBody(req, sendNotificationSchema);
  if (error) return error;

  try {
    await notificationService.send(data);
    return successResponse(null, 'Notification sent');
  } catch {
    return serverErrorResponse();
  }
}

export async function markAllReadController(req: AuthReq) {
  try {
    const count = await notificationService.markAllAsRead(req.user.id);
    return successResponse({ marked: count }, 'Notifications marked as read');
  } catch {
    return serverErrorResponse();
  }
}

export async function registerDeviceTokenController(req: AuthReq) {
  const { data, error } = await validateBody(req, deviceTokenSchema);
  if (error) return error;

  try {
    await notificationService.registerDeviceToken(req.user.id, data.token, data.platform);
    return successResponse(null, 'Device token registered');
  } catch {
    return serverErrorResponse();
  }
}
