import { useCallback, useEffect, useState } from 'react';

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
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    try {
      setUnread(await NotificationService.unreadCount());
    } catch {
      // Intentionally ignored; see above.
    }
  }, []);

  useEffect(() => {
    void load();

    const timer = window.setInterval(() => void load(), REFRESH_MS);

    return () => window.clearInterval(timer);
  }, [load]);

  return { unread, refresh: load };
}
