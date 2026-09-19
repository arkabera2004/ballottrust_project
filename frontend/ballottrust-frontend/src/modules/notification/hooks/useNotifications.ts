import { useCallback, useEffect, useState } from 'react';

import { NotificationService } from '../services';
import ApiError from '../../../utils/api-error';

import type { AppNotification, QueryNotificationDto } from '../types';
import type { PaginationMeta } from '../../../types/api.types';

const EMPTY_META: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
};

export function useNotifications(query?: QueryNotificationDto) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META);

  const queryKey = JSON.stringify(query ?? {});

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const result = await NotificationService.getAll(
        JSON.parse(queryKey) as QueryNotificationDto,
      );

      setItems(result.items);
      setMeta(result.meta);
    } catch (err) {
      ApiError.handle(err);
    } finally {
      setLoading(false);
    }
  }, [queryKey]);

  useEffect(() => {
    void load();
  }, [load]);

  return { loading, items, meta, refresh: load };
}
