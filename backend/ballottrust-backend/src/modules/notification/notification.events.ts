import { NotificationType } from '@prisma/client';

/**
 * Event name modules emit to raise a notification.
 *
 * Going through the event bus rather than injecting NotificationService
 * directly keeps the dependency arrow pointing one way: the notification
 * module listens to the rest of the platform, and no module has to
 * import it to announce something. docs/07 §13 lists this module's
 * dependency as "Every Module", which is only tractable if the coupling
 * is inverted like this.
 */
export const NOTIFICATION_REQUESTED = 'notification.requested';

export interface NotificationRequestedEvent {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  /** Deep link into the app, e.g. /elections/:id. */
  link?: string;
  actionLabel?: string;
  /** What the notification is about, for correlation. */
  entityType?: string;
  entityId?: string;
  /** Also deliver by email. Defaults to false (in-app only). */
  sendEmail?: boolean;
}
