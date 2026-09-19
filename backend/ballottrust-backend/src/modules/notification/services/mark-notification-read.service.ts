import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { NotificationRepository } from '../repository/notification.repository';

@Injectable()
export class MarkNotificationReadService {
  constructor(private readonly repository: NotificationRepository) {}

  async execute(id: string, userId: string) {
    const notification = await this.repository.findById(id);

    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }

    // A notification is addressed to exactly one user; nobody else may
    // read, archive or dismiss it — not even an administrator.
    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'This notification is not addressed to you.',
      );
    }

    if (notification.isRead) {
      return notification;
    }

    return this.repository.update(id, { isRead: true, readAt: new Date() });
  }
}
