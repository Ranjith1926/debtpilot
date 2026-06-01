import prisma from '@/lib/prisma';
import type { Notification, Prisma, NotificationType } from '@prisma/client';
import { getPrismaSkipTake } from '@/utils/pagination';

export class NotificationRepository {
  async create(data: Prisma.NotificationCreateInput): Promise<Notification> {
    return prisma.notification.create({ data });
  }

  async createMany(notifications: Prisma.NotificationCreateManyInput[]): Promise<number> {
    const result = await prisma.notification.createMany({ data: notifications });
    return result.count;
  }

  async findByUser(
    userId: string,
    unreadOnly = false,
    pagination = { page: 1, limit: 20 },
  ): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(unreadOnly && { readStatus: false }),
    };
    const { skip, take } = getPrismaSkipTake(pagination.page, pagination.limit);

    const [notifications, total, unreadCount] = await prisma.$transaction([
      prisma.notification.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, readStatus: false } }),
    ]);

    return { notifications, total, unreadCount };
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data: { readStatus: true },
    });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, readStatus: false },
      data: { readStatus: true },
    });
    return result.count;
  }

  async findDeviceTokens(userId: string): Promise<string[]> {
    const tokens = await prisma.deviceToken.findMany({
      where: { userId, isActive: true },
      select: { token: true },
    });
    return tokens.map((t) => t.token);
  }

  async upsertDeviceToken(userId: string, token: string, platform: string): Promise<void> {
    await prisma.deviceToken.upsert({
      where: { token },
      create: { userId, token, platform },
      update: { isActive: true, userId },
    });
  }

  async deactivateDeviceToken(token: string): Promise<void> {
    await prisma.deviceToken.updateMany({
      where: { token },
      data: { isActive: false },
    });
  }
}

export const notificationRepository = new NotificationRepository();
