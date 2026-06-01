import { MockAPI } from '@api/mock.client';
import { Notification } from '@/types/notification.types';

export const NotificationService = {
  getAll: async (): Promise<Notification[]> => {
    const res = await MockAPI.notifications.getAll();
    return res.data;
  },

  markRead: async (id: string): Promise<void> => {
    await MockAPI.notifications.markRead(id);
  },

  markAllRead: async (): Promise<void> => {
    await MockAPI.notifications.markAllRead();
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await MockAPI.notifications.getUnreadCount();
    return (res.data as { count: number }).count;
  },
};
