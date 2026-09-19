import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { CreateNotificationService } from './services/create-notification.service';
import {
  NOTIFICATION_REQUESTED,
  type NotificationRequestedEvent,
} from './notification.events';

/**
 * Bridges the event bus to the Notification Center.
 *
 * Failures are logged and swallowed: a notification is a side effect of
 * an election action, never a reason to fail one. An emitter that raised
 * an event has already committed its own work.
 */
@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);

  constructor(
    private readonly createNotificationService: CreateNotificationService,
  ) {}

  @OnEvent(NOTIFICATION_REQUESTED, { async: true })
  async handle(event: NotificationRequestedEvent) {
    try {
      await this.createNotificationService.execute(event);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);

      this.logger.error(
        `Failed to raise notification for user ${event.userId}: ${reason}`,
      );
    }
  }
}
