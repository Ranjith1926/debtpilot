import { apiClient } from '@api/axios.client';
import { Notification } from '@/types/notification.types';
import { ENDPOINTS } from '@constants/endpoints';

function mapNotificationFromApi(raw: Record<string, unknown>): Notification {
  return {
    id: raw.id as string,
    type: mapNotifType(raw.type as string),
    title: raw.title as string,
    body: raw.body as string,
    isRead: raw.readStatus as boolean,
    createdAt: raw.createdAt as string,
    loanId: (raw.data as Record<string, unknown>)?.loanId as string | undefined,
    amount: (raw.data as Record<string, unknown>)?.amount ? Number((raw.data as Record<string, unknown>).amount) : undefined,
    dueDate: (raw.data as Record<string, unknown>)?.dueDate as string | undefined,
  };
}

function mapNotifType(type: string): Notification['type'] {
  const map: Record<string, Notification['type']> = {
    EMI_REMINDER: 'due_soon',
    OVERDUE_ALERT: 'overdue',
    PAYMENT_SUCCESS: 'payment_success',
    PAYMENT_FAILED: 'payment_failed',
    SYSTEM: 'system',
  };
  return map[type] ?? 'system';
}

export const NotificationService = {
  getAll: async (): Promise<Notification[]> => {
    const res = await apiClient.get(ENDPOINTS.NOTIFICATIONS.LIST);
    return (res.data.data?.notifications ?? []).map(mapNotificationFromApi);
  },

  markRead: async (id: string): Promise<void> => {
    await apiClient.patch(ENDPOINTS.NOTIFICATIONS.LIST, { id });
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get(ENDPOINTS.NOTIFICATIONS.LIST);
    return res.data.data?.unreadCount ?? 0;
  },
};
