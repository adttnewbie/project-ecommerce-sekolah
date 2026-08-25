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
import {
    NOTIFICATION_TYPE_CONFIG,
    NOTIFICATION_TYPE_STYLE,
} from '@/types/notification';
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
    const style =
        NOTIFICATION_TYPE_STYLE[
            notification.type as keyof typeof NOTIFICATION_TYPE_STYLE
        ];
    const IconComponent = typeIcon(notification.type);
    const accent = config?.accentColor ?? '#64748B';
    const label = config?.label ?? 'Notifikasi';
    const iconBg = style?.iconBg ?? '#F1F5F9';
    const iconColor = style?.iconColor ?? accent;

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
        <div
            className={cn(
                'group relative flex min-h-[72px] items-start gap-3 border-b border-slate-50 px-4 py-3.5 transition duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] last:border-b-0 hover:bg-[#EFF8FF]/70',
                !notification.is_read && 'bg-[#EFF8FF]/35',
            )}
        >
            {/* Left accent bar — unread only */}
            {!notification.is_read && (
                <span
                    className="absolute top-2 bottom-2 left-0 w-1 rounded-full"
                    style={{ backgroundColor: accent }}
                    aria-hidden="true"
                />
            )}

            {/* Icon bubble — 20px icon per design.md:1002, 36px bubble (size-9) */}
            <span
                className={cn(
                    'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border',
                    !notification.is_read
                        ? 'border-[#BCE0FF] bg-[#EFF8FF] text-[#0080FF]'
                        : 'border-slate-100 bg-slate-50 text-slate-500',
                )}
                style={
                    !notification.is_read
                        ? { backgroundColor: iconBg, color: iconColor, borderColor: style?.border }
                        : undefined
                }
                aria-hidden="true"
            >
                {createElement(IconComponent, { className: 'size-5' })}
                {!notification.is_read && (
                    <span
                        className="absolute size-2 rounded-full ring-2 ring-white"
                        style={{
                            backgroundColor: accent,
                            top: '14px',
                            left: '30px',
                        }}
                        aria-hidden="true"
                    />
                )}
            </span>

            {/* Dismiss — always visible on mobile, hover on desktop */}
            <button
                type="button"
                onClick={dismiss}
                className="absolute top-2 right-2 z-10 flex size-8 items-center justify-center rounded-full text-slate-400 opacity-100 transition duration-200 hover:bg-white hover:text-[#DC2626] focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[rgba(0,128,255,0.45)] focus-visible:ring-offset-2 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                aria-label={`Hapus notifikasi ${notification.title}`}
                title="Hapus"
            >
                <X className="size-3.5" />
            </button>

            <Link
                href={notification.href}
                onClick={handleClick}
                className="flex min-w-0 flex-1 flex-col items-start gap-1 rounded-[10px] pr-8 outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,128,255,0.45)] focus-visible:ring-offset-2"
            >
                <span className="line-clamp-2 w-full text-sm leading-5">
                    <span
                        className={cn(
                            notification.is_read
                                ? 'font-normal text-slate-700'
                                : 'font-semibold text-slate-900',
                        )}
                    >
                        {notification.title}
                    </span>
                    {!notification.is_read && (
                        <span className="ml-1.5 inline-flex items-center rounded-[6px] bg-[#EFF8FF] px-1.5 py-0.5 text-[11px] font-medium leading-none text-[#006FE0]">
                            Baru
                        </span>
                    )}
                </span>
                {notification.description && (
                    <span className="line-clamp-2 w-full text-sm leading-5 text-slate-600">
                        {notification.description}
                    </span>
                )}
                <span className="flex w-full items-center gap-1.5 pt-0.5 text-xs leading-none">
                    <span
                        className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium leading-none',
                            !notification.is_read
                                ? 'bg-[#EFF8FF] text-[#006FE0]'
                                : 'bg-slate-100 text-slate-500',
                        )}
                    >
                        {label}
                    </span>
                    {!notification.is_read && (
                        <span className="text-[11px] font-medium text-[#006FE0]">
                            • belum dibaca
                        </span>
                    )}
                    <span className="ml-auto shrink-0 text-xs text-slate-400">
                        {formatNotificationTimestamp(
                            notification.created_at ?? '',
                            { compact: true },
                        )}
                    </span>
                </span>
            </Link>
        </div>
    );
}
