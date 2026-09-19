import type { PaginationMeta } from '../../../types/api.types';

export const NotificationType = {
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  SECURITY: 'SECURITY',
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationDeliveryStatus = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED',
} as const;

export type NotificationDeliveryStatus =
  (typeof NotificationDeliveryStatus)[keyof typeof NotificationDeliveryStatus];

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  isArchived: boolean;
  readAt: string | null;
  link: string | null;
  actionLabel: string | null;
  entityType: string | null;
  entityId: string | null;
  emailStatus: NotificationDeliveryStatus | null;
  createdAt: string;
}

export interface QueryNotificationDto {
  type?: NotificationType;
  isRead?: boolean;
  isArchived?: boolean;
  page?: number;
  limit?: number;
}

export interface NotificationListResponse {
  items: AppNotification[];
  meta: PaginationMeta;
}
