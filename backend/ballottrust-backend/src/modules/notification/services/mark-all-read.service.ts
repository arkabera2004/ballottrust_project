import { Injectable } from '@nestjs/common';

import { NotificationRepository } from '../repository/notification.repository';

@Injectable()
export class MarkAllReadService {
  constructor(private readonly repository: NotificationRepository) {}

  async execute(userId: string) {
    const { count } = await this.repository.markAllRead(userId);

    return { updated: count };
  }
}
