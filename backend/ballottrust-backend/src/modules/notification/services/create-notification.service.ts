import { Injectable, Logger } from '@nestjs/common';
import { NotificationDeliveryStatus, NotificationType } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationRepository } from '../repository/notification.repository';
import { MailService } from '../../mail/mail.service';
import type { NotificationRequestedEvent } from '../notification.events';

/**
 * Writes the in-app notification, then delivers the optional email leg.
 *
 * docs/07 §13 requires notifications to be generated asynchronously. The
 * in-app row is written synchronously so the caller's transaction sees a
 * definite outcome, but the email is dispatched without blocking: a slow
 * or unavailable SMTP server must never stall (or fail) the election
 * action that triggered the notification. The send outcome is recorded
 * against the row, satisfying "delivery status is tracked".
 */
@Injectable()
export class CreateNotificationService {
  private readonly logger = new Logger(CreateNotificationService.name);

  constructor(
    private readonly prisma: PrismaService,

    private readonly repository: NotificationRepository,

    private readonly mailService: MailService,
  ) {}

  async execute(event: NotificationRequestedEvent) {
    const notification = await this.repository.create({
      user: { connect: { id: event.userId } },
      title: event.title,
      message: event.message,
      type: event.type ?? NotificationType.INFO,
      link: event.link,
      actionLabel: event.actionLabel,
      entityType: event.entityType,
      entityId: event.entityId,
      emailStatus: event.sendEmail
        ? NotificationDeliveryStatus.PENDING
        : undefined,
    });

    if (event.sendEmail) {
      // Intentionally not awaited: see the class comment.
      void this.deliverEmail(notification.id, event);
    }

    return notification;
  }

  private async deliverEmail(
    notificationId: string,
    event: NotificationRequestedEvent,
  ) {
    try {
      const recipient = await this.prisma.user.findUnique({
        where: { id: event.userId },
        select: { email: true },
      });

      if (!recipient?.email) {
        throw new Error('Recipient has no email address on file.');
      }

      await this.mailService.sendNotificationEmail({
        email: recipient.email,
        title: event.title,
        message: event.message,
        link: event.link,
        actionLabel: event.actionLabel,
      });

      await this.repository.recordEmailOutcome(
        notificationId,
        NotificationDeliveryStatus.SENT,
      );
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);

      this.logger.warn(
        `Failed to email notification ${notificationId}: ${reason}`,
      );

      await this.repository
        .recordEmailOutcome(
          notificationId,
          NotificationDeliveryStatus.FAILED,
          reason,
        )
        .catch(() => {
          // The notification itself is already stored; losing the status
          // update must not escalate into an unhandled rejection.
        });
    }
  }
}
