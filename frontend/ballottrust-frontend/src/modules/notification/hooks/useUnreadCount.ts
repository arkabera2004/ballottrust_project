import { useQuery } from '@tanstack/react-query';

import { NotificationService } from '../services';

/** Poll interval for the header badge. */
const REFRESH_MS = 60_000;

/**
 * Unread badge count.
 *
 * Polled rather than pushed: the backend has no websocket channel, and a
 * minute's latency on a notification badge is not worth standing one up.
 * Failures are swallowed — a stale badge must never surface an error
 * toast over whatever the user is actually doing.
 */
export function useUnreadCount() {
  const { data: unread = 0, refetch } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => NotificationService.unreadCount(),
    refetchInterval: REFRESH_MS,
    // Matches the previous behavior: a failed poll leaves the last known
    // count on screen rather than surfacing an error.
    throwOnError: false,
  });

  return { unread, refresh: refetch };
}
