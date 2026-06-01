import { notificationRepository } from '@/repositories/notification.repository';
import { sendMulticastPush } from '@/firebase/fcm';
import { cacheDel } from '@/lib/redis';
import { CACHE_KEYS } from '@/config/constants';
import type { NotificationType } from '@prisma/client';

interface SendNotificationInput {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, string>;
}

export class NotificationService {
  async send(input: SendNotificationInput): Promise<void> {
    await notificationRepository.create({
      user: { connect: { id: input.userId } },
      title: input.title,
      body: input.body,
      type: input.type,
      data: input.data ?? {},
      sentAt: new Date(),
    });

    const tokens = await notificationRepository.findDeviceTokens(input.userId);
    if (tokens.length > 0) {
      const { failedTokens } = await sendMulticastPush(tokens, {
        title: input.title,
        body: input.body,
        data: input.data,
      });

      for (const token of failedTokens) {
        await notificationRepository.deactivateDeviceToken(token);
      }
    }

    await cacheDel(CACHE_KEYS.NOTIFICATIONS(input.userId));
  }

  async sendEmiReminder(userId: string, lenderName: string, amount: number, daysUntilDue: number): Promise<void> {
    const isOverdue = daysUntilDue < 0;
    await this.send({
      userId,
      title: isOverdue ? '⚠️ EMI Overdue' : '💳 EMI Reminder',
      body: isOverdue
        ? `Your EMI of ₹${amount.toLocaleString()} for ${lenderName} is overdue!`
        : `Your EMI of ₹${amount.toLocaleString()} for ${lenderName} is due in ${daysUntilDue} day(s).`,
      type: isOverdue ? 'OVERDUE_ALERT' : 'EMI_REMINDER',
      data: { lenderName, amount: String(amount), daysUntilDue: String(daysUntilDue) },
    });
  }

  async sendPaymentConfirmation(
    userId: string,
    info: { amount: number; lenderName: string; transactionId?: string },
  ): Promise<void> {
    await this.send({
      userId,
      title: '✅ Payment Successful',
      body: `Payment of ₹${info.amount.toLocaleString()} to ${info.lenderName} was successful.`,
      type: 'PAYMENT_SUCCESS',
      data: {
        amount: String(info.amount),
        lenderName: info.lenderName,
        transactionId: info.transactionId ?? '',
      },
    });
  }

  async getNotifications(userId: string, unreadOnly: boolean, pagination = { page: 1, limit: 20 }) {
    return notificationRepository.findByUser(userId, unreadOnly, pagination);
  }

  async markAsRead(id: string, userId: string) {
    return notificationRepository.markAsRead(id, userId);
  }

  async markAllAsRead(userId: string): Promise<number> {
    const count = await notificationRepository.markAllAsRead(userId);
    await cacheDel(CACHE_KEYS.NOTIFICATIONS(userId));
    return count;
  }

  async registerDeviceToken(userId: string, token: string, platform: string): Promise<void> {
    await notificationRepository.upsertDeviceToken(userId, token, platform);
  }
}

export const notificationService = new NotificationService();
