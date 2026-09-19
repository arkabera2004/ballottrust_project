import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { NotificationRepository } from '../repository/notification.repository';
import { QueryNotificationDto } from '../dto';

@Injectable()
export class ListNotificationsService {
  constructor(private readonly repository: NotificationRepository) {}

  async execute(userId: string, query: QueryNotificationDto) {
    const where: Prisma.NotificationWhereInput = { userId };

    if (query.type) {
      where.type = query.type;
    }

    if (query.isRead !== undefined) {
      where.isRead = query.isRead;
    }

    // Archived notifications are hidden unless explicitly requested.
    where.isArchived = query.isArchived ?? false;

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const { items, total } = await this.repository.findMany(
      where,
      (page - 1) * limit,
      limit,
    );

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
