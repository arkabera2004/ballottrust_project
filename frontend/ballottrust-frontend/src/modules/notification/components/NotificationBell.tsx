import { useEffect, useRef, useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useNotifications, useUnreadCount } from '../hooks';
import { NotificationService } from '../services';
import ApiError from '../../../utils/api-error';

import type { AppNotification } from '../types';

const TONE: Record<string, string> = {
  INFO: 'bg-blue-500',
  SUCCESS: 'bg-green-500',
  WARNING: 'bg-amber-500',
  ERROR: 'bg-red-500',
  SECURITY: 'bg-purple-500',
};

function relativeTime(iso: string): string {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h ago`;

  return `${Math.floor(seconds / 86_400)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { unread, refresh: refreshCount } = useUnreadCount();
  const { loading, items, refresh } = useNotifications({ limit: 10 });

  // Close on an outside click or Escape, so the panel behaves like the
  // menu it looks like.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function toggle() {
    const next = !open;

    setOpen(next);

    if (next) {
      void refresh();
    }
  }

  async function handleOpenNotification(notification: AppNotification) {
    try {
      if (!notification.isRead) {
        await NotificationService.markRead(notification.id);

        void refresh();
        void refreshCount();
      }

      if (notification.link) {
        setOpen(false);
        navigate(notification.link);
      }
    } catch (err) {
      ApiError.handle(err);
    }
  }

  async function handleMarkAllRead() {
    try {
      await NotificationService.markAllRead();

      void refresh();
      void refreshCount();
    } catch (err) {
      ApiError.handle(err);
    }
  }

  async function handleDismiss(id: string) {
    try {
      await NotificationService.dismiss(id);

      void refresh();
      void refreshCount();
    } catch (err) {
      ApiError.handle(err);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggle}
        aria-label={
          unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'
        }
        aria-expanded={open}
        className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />

        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Notifications
            </h2>

            {unread > 0 && (
              <button
                type="button"
                onClick={() => void handleMarkAllRead()}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="p-6 text-center text-sm text-slate-500">
                Loading…
              </p>
            ) : items.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-500">
                Nothing to catch up on.
              </p>
            ) : (
              <ul>
                {items.map((notification) => (
                  <li
                    key={notification.id}
                    className={`flex gap-3 border-b border-slate-50 px-4 py-3 ${
                      notification.isRead ? '' : 'bg-blue-50/40'
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        TONE[notification.type] ?? 'bg-slate-400'
                      }`}
                      aria-hidden="true"
                    />

                    <button
                      type="button"
                      onClick={() => void handleOpenNotification(notification)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate text-sm font-medium text-slate-900">
                        {notification.title}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-600">
                        {notification.message}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400">
                        {relativeTime(notification.createdAt)}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDismiss(notification.id)}
                      aria-label="Dismiss notification"
                      className="h-fit rounded-full p-1 text-slate-400 hover:bg-slate-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
