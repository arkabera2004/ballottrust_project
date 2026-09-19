import { Injectable } from '@nestjs/common';

import { NotificationRepository } from '../repository/notification.repository';

@Injectable()
export class UnreadCountService {
  constructor(private readonly repository: NotificationRepository) {}

  async execute(userId: string) {
    return { unread: await this.repository.countUnread(userId) };
  }
}
