import { Link, router } from '@inertiajs/react';
import { Bell } from 'lucide-react';

import { HeaderNotificationItem } from '@/components/notifications/header-notification-item';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { NotificationForDropdown } from '@/types/notifications';

const notificationMenuClassName =
    'w-80 max-h-[24rem] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300';

const notificationMenuStyle = {
    maxHeight: 'var(--radix-dropdown-menu-content-available-height)',
} as const;

type NotificationDropdownProps = {
    /** Rendered inside the (controlled) trigger slot of the host menu. */
    children: React.ReactNode;
    notifications: NotificationForDropdown[] | undefined;
    unreadCount: number;
    ariaLabel?: string;
    emptyTitle?: string;
    emptyText?: string;
};

/**
 * Shared bell dropdown for every role. Reads persisted notifications and
 * exposes mark-all-read / view-all actions against /notifications.
 */
export function NotificationDropdown({
    children,
    notifications,
    unreadCount,
    ariaLabel = 'Notifikasi',
    emptyTitle = 'Tidak ada notifikasi baru',
    emptyText = 'Kabar terbaru akan muncul di sini',
}: NotificationDropdownProps) {
    const items = notifications ?? [];
    const hasItems = items.length > 0;

    const markAllAsRead = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        router.post(
            '/notifications/mark-all-as-read',
            {},
            { preserveScroll: true },
        );
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className={notificationMenuClassName}
                style={notificationMenuStyle}
                sideOffset={8}
            >
                <div className="sticky top-0 z-10 flex items-center justify-between gap-2 rounded-t-[inherit] border-b border-slate-100 bg-white px-3 py-3">
                    <h3 className="text-sm font-semibold text-slate-900">
                        {ariaLabel}
                        {unreadCount > 0 && (
                            <span className="ml-2 rounded-[6px] bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-700">
                                {unreadCount > 99 ? '99+' : unreadCount} belum
                                dibaca
                            </span>
                        )}
                    </h3>
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={markAllAsRead}
                            className="shrink-0 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
                        >
                            Tandai semua dibaca
                        </button>
                    )}
                </div>

                {hasItems ? (
                    <>
                        {items.map((notification) => (
                            <HeaderNotificationItem
                                key={notification.key}
                                notification={notification}
                            />
                        ))}
                        <div className="border-t border-slate-100 p-2">
                            <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs text-blue-600"
                            >
                                <Link href="/notifications">
                                    Lihat semua notifikasi
                                </Link>
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-50">
                            <Bell className="size-5 text-slate-400" />
                        </div>
                        <p className="mb-1 text-sm font-medium text-slate-900">
                            {emptyTitle}
                        </p>
                        <p className="text-xs text-slate-500">{emptyText}</p>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
