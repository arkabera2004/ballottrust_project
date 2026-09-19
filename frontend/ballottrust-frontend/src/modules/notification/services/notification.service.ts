import api from '../../../api/axios';

import type {
  AppNotification,
  NotificationListResponse,
  QueryNotificationDto,
} from '../types';

class NotificationService {
  async getAll(
    params?: QueryNotificationDto,
  ): Promise<NotificationListResponse> {
    const response = await api.get('/notifications', { params });

    return response.data.data;
  }

  async unreadCount(): Promise<number> {
    const response = await api.get('/notifications/unread-count');

    return (response.data.data as { unread: number }).unread;
  }

  async markRead(id: string) {
    const response = await api.patch(`/notifications/${id}/read`);

    return response.data.data as AppNotification;
  }

  async markAllRead() {
    const response = await api.patch('/notifications/read-all');

    return response.data.data as { updated: number };
  }

  async archive(id: string) {
    const response = await api.patch(`/notifications/${id}/archive`);

    return response.data.data as AppNotification;
  }

  async dismiss(id: string) {
    const response = await api.delete(`/notifications/${id}`);

    return response.data.data as { success: boolean };
  }
}

export default new NotificationService();
