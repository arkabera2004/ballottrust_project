import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { NotificationRepository } from '../repository/notification.repository';

@Injectable()
export class ArchiveNotificationService {
  constructor(private readonly repository: NotificationRepository) {}

  async execute(id: string, userId: string) {
    const notification = await this.repository.findById(id);

    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'This notification is not addressed to you.',
      );
    }

    return this.repository.update(id, { isArchived: true });
  }
}
