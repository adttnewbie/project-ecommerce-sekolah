import { Link, router } from '@inertiajs/react';
import {
    Bell,
    Boxes,
    CreditCard,
    Gift,
    Package,
    Settings,
    ShoppingCart,
    X,
} from 'lucide-react';
import { createElement } from 'react';
import { toast } from 'sonner';

import { formatNotificationTimestamp } from '@/lib/formatNotificationTimestamp';
import { cn } from '@/lib/utils';
import { NOTIFICATION_TYPE_CONFIG } from '@/types/notification';
import type { NotificationForDropdown } from '@/types/notifications';

const typeIcons = {
    order: ShoppingCart,
    stock: Boxes,
    product: Package,
    payment: CreditCard,
    system: Settings,
    promotion: Gift,
} as const;

function typeIcon(type: string) {
    return typeIcons[type as keyof typeof typeIcons] ?? Bell;
}

/**
 * One notification row inside the header bell dropdown. Mirrors the
 * /notifications page behaviour: unread items are marked read on click and
 * navigation always continues, even if the mark-as-read request fails.
 */
export function HeaderNotificationItem({
    notification,
}: {
    notification: NotificationForDropdown;
}) {
    const config =
        NOTIFICATION_TYPE_CONFIG[
            notification.type as keyof typeof NOTIFICATION_TYPE_CONFIG
        ];
    const IconComponent = typeIcon(notification.type);
    const accent = config?.accentColor ?? '#6b7280';
    const label = config?.label ?? 'Notifikasi';

    const dismiss = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();

        router.delete(
            `/notifications/${encodeURIComponent(notification.key)}`,
            {
                preserveScroll: true,
                onError: () => toast.error('Notifikasi gagal dihapus.'),
            },
        );
    };

    const handleClick = (event: React.MouseEvent) => {
        if (notification.is_read) {
            return; // plain anchor navigation
        }

        event.preventDefault();

        // Navigation always continues; a failed read-request never blocks
        // the user from opening the notification target.
        try {
            router.post(
                `/notifications/${encodeURIComponent(notification.key)}/read`,
                {},
                { preserveScroll: true },
            );
            window.location.href = notification.href;
        } catch {
            window.location.href = notification.href;
        }
    };

    return (
        <div className="group relative flex items-start gap-3 border-b border-slate-50 px-4 py-3 transition-colors duration-150 last:border-b-0 hover:bg-blue-50/60">
            {!notification.is_read && (
                <span
                    className="absolute top-4 left-[27px] size-2 rounded-full ring-2 ring-white"
                    style={{ backgroundColor: accent }}
                    aria-hidden="true"
                />
            )}
            <span
                className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${accent}1a`, color: accent }}
                aria-hidden="true"
            >
                {createElement(IconComponent, { className: 'size-4' })}
            </span>
            <button
                type="button"
                onClick={dismiss}
                className="absolute top-2 right-2 z-10 rounded-lg p-1.5 text-slate-400 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-white hover:text-rose-600 focus:opacity-100 focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label={`Hapus notifikasi ${notification.title}`}
            >
                <X className="size-3.5" />
            </button>
            <Link
                href={notification.href}
                onClick={handleClick}
                className={cn(
                    'relative z-0 flex min-w-0 flex-1 flex-col items-start gap-0.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                )}
            >
                <span className="flex w-full items-center justify-between gap-2">
                    <span
                        className={cn(
                            'max-w-full truncate text-sm text-slate-900',
                            !notification.is_read && 'font-semibold',
                        )}
                    >
                        {notification.title}
                    </span>
                    <span className="shrink-0 text-[11px] leading-none text-slate-400">
                        {formatNotificationTimestamp(
                            notification.created_at ?? '',
                        )}
                    </span>
                </span>
                <span className="line-clamp-2 w-full text-xs leading-5 text-slate-500">
                    {notification.description}
                </span>
                <span
                    className={cn(
                        'text-[11px] font-medium',
                        !notification.is_read
                            ? 'text-blue-700'
                            : 'text-slate-400',
                    )}
                >
                    {label}
                    {!notification.is_read && ' • belum dibaca'}
                </span>
            </Link>
        </div>
    );
}
