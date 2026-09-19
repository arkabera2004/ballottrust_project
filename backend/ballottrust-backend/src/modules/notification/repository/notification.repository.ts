import { Injectable } from '@nestjs/common';
import { NotificationDeliveryStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.NotificationCreateInput) {
    return this.prisma.notification.create({ data });
  }

  async findById(id: string) {
    return this.prisma.notification.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findMany(where: Prisma.NotificationWhereInput, skip = 0, take = 20) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: { ...where, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.notification.count({
        where: { ...where, deletedAt: null },
      }),
    ]);

    return { items, total };
  }

  async countUnread(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false, isArchived: false, deletedAt: null },
    });
  }

  async update(id: string, data: Prisma.NotificationUpdateInput) {
    return this.prisma.notification.update({ where: { id }, data });
  }

  /** Marks every unread notification for a user as read. */
  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false, deletedAt: null },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async softDelete(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async recordEmailOutcome(
    id: string,
    status: NotificationDeliveryStatus,
    error?: string,
  ) {
    return this.prisma.notification.update({
      where: { id },
      data: {
        emailStatus: status,
        emailSentAt:
          status === NotificationDeliveryStatus.SENT ? new Date() : null,
        emailError: error ?? null,
      },
    });
  }
}
