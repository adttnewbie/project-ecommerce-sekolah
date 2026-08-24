import { router } from '@inertiajs/react';
import { formatNotificationTimestamp } from '@/lib/formatNotificationTimestamp';
import { cn } from '@/lib/utils';
import { NOTIFICATION_TYPE_CONFIG } from '@/types/notification';
import type { Notification } from '@/types/notifications';

interface NotificationItemProps {
    notification: Notification;
    onClick?: () => void;
    onMarkAsRead?: (key: string) => void;
    onDismiss?: (key: string) => void;
    isSelectable?: boolean;
    isSelected?: boolean;
    showActions?: boolean;
}

export function NotificationItem({
    notification,
    onMarkAsRead,
    onDismiss,
    isSelectable = false,
    isSelected = false,
    showActions = true,
}: NotificationItemProps) {
    const configType =
        notification.type as keyof typeof NOTIFICATION_TYPE_CONFIG;
    const config = NOTIFICATION_TYPE_CONFIG[configType];
    const accentColor = config.accentColor;

    const handleDismissClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (onDismiss) {
            onDismiss(notification.key);
        }
    };

    const handleClick = async (e: React.MouseEvent) => {
        if (!notification.is_read && onMarkAsRead) {
            e.preventDefault();

            try {
                router.post(
                    `/notifications/${encodeURIComponent(notification.key)}/read`,
                    {},
                    {
                        preserveScroll: true,
                    },
                );

                if (typeof onMarkAsRead === 'function') {
                    onMarkAsRead(notification.key);
                }

                window.location.href = notification.href;
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
                window.location.href = notification.href;
            }
        }
    };

    return (
        <a
            href={notification.href}
            onClick={handleClick}
            className={cn(
                'group flex items-start gap-3 p-4 transition-all duration-200',
                'rounded-lg border-l-4 shadow-sm hover:shadow-md',
                'bg-white hover:bg-blue-50/50',
                'relative cursor-pointer',
                notification.is_read
                    ? 'border-l-blue-300'
                    : 'border-l-blue-500 bg-blue-50/40',
            )}
        >
            {/* Unread indicator dot */}
            {!notification.is_read && (
                <div
                    className="mt-2 size-2 shrink-0 rounded-full bg-blue-500 opacity-70 ring-2 ring-white"
                    aria-hidden="true"
                />
            )}

            {/* Content */}
            <div className="min-w-0 flex-1">
                {/* Title with optional unread badge */}
                <div className="flex items-start gap-2">
                    <span
                        className={cn(
                            'text-base font-medium break-words transition-colors',
                            notification.is_read
                                ? 'text-slate-700 group-hover:text-slate-900'
                                : 'font-semibold text-slate-900',
                        )}
                    >
                        {notification.title}
                    </span>

                    {/* Type icon placeholder - can be replaced with actual icons later */}
                    {!notification.is_read && (
                        <div
                            className="size-5 shrink-0 rounded-full"
                            style={{ backgroundColor: accentColor + '20' }}
                            aria-label={`Tipe notifikasi: ${config.label}`}
                        />
                    )}
                </div>

                {/* Description */}
                {notification.description && (
                    <p className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-slate-500">
                        {notification.description}
                    </p>
                )}

                {/* Timestamp */}
                <div className="mt-2">
                    <time
                        className="text-xs text-slate-400"
                        dateTime={notification.created_at}
                    >
                        {formatNotificationTimestamp(notification.created_at)}
                    </time>
                </div>
            </div>

            {/* Action buttons (hover on desktop, always visible on mobile) */}
            {showActions && (
                <>
                    {/* Dismiss button */}
                    {onDismiss && (
                        <button
                            type="button"
                            onClick={handleDismissClick}
                            className={cn(
                                'absolute top-3 right-3 rounded-lg p-1.5 transition-all duration-200',
                                'opacity-0 group-hover:opacity-100 focus:opacity-100',
                                'text-slate-400 hover:bg-white hover:text-rose-600',
                                'focus:ring-2 focus:ring-blue-500 focus:outline-none',
                            )}
                            aria-label={`Hapus notifikasi: ${notification.title}`}
                        >
                            <svg
                                className="size-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    )}

                    {/* Checkbox for batch selection */}
                    {isSelectable && (
                        <div className="pointer-events-auto absolute top-3 right-3 z-10 hidden sm:block">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => e.stopPropagation()}
                                className="size-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                aria-label={`Pilih notifikasi: ${notification.title}`}
                            />
                        </div>
                    )}
                </>
            )}
        </a>
    );
}
