import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { NotificationService } from '../services';
import ApiError from '../../../utils/api-error';

import type { QueryNotificationDto } from '../types';
import type { PaginationMeta } from '../../../types/api.types';

const EMPTY_META: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
};

export function useNotifications(query?: QueryNotificationDto) {
  const queryKey = JSON.stringify(query ?? {});

  const result = useQuery({
    queryKey: ['notifications', queryKey],
    queryFn: () =>
      NotificationService.getAll(JSON.parse(queryKey) as QueryNotificationDto),
  });

  // ApiError.handle() shows a toast — a side effect, not a state sync, so
  // it belongs in an effect reacting to the query's error rather than in
  // the query itself.
  useEffect(() => {
    if (result.error) {
      ApiError.handle(result.error);
    }
  }, [result.error]);

  return {
    loading: result.isLoading,
    items: result.data?.items ?? [],
    meta: result.data?.meta ?? EMPTY_META,
    refresh: result.refetch,
  };
}
