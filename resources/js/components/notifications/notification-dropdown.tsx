import { Link, router } from '@inertiajs/react';
import { Bell, X } from 'lucide-react';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import { HeaderNotificationItem } from '@/components/notifications/header-notification-item';
import { NotificationEmptyState } from '@/components/notifications/NotificationEmptyState';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import type { NotificationForDropdown } from '@/types/notifications';

const NOTIF_MOBILE_BREAKPOINT = 640;
const notifMediaQuery = `(max-width: ${NOTIF_MOBILE_BREAKPOINT - 1}px)`;

function subscribeNotif(callback: () => void) {
    const mql = window.matchMedia(notifMediaQuery);

    mql.addEventListener('change', callback);

    return () => mql.removeEventListener('change', callback);
}

function getSnapshotNotif() {
    return window.matchMedia(notifMediaQuery).matches;
}

function getServerSnapshotNotif() {
    return false;
}

function useIsNotifMobile() {
    return useSyncExternalStore(
        subscribeNotif,
        getSnapshotNotif,
        getServerSnapshotNotif,
    );
}

const desktopMenuClassName =
    'flex w-[24rem] max-w-[calc(100vw-1.5rem)] max-h-[28rem] flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white p-0 shadow-[0_8px_24px_rgba(15,23,42,0.08)] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]';

const desktopMenuStyle = {
    maxHeight: 'var(--radix-dropdown-menu-content-available-height)',
} as const;

type NotificationDropdownProps = {
    /** Rendered inside the trigger slot */
    children: React.ReactNode;
    notifications: NotificationForDropdown[] | undefined;
    unreadCount: number;
    ariaLabel?: string;
    emptyTitle?: string;
    emptyText?: string;
};

type FilterTab = 'all' | 'unread';

/**
 * Shared bell panel for every role — adaptive:
 * - desktop: anchored DropdownMenuContent
 * - mobile: bottom Sheet 85vh
 * Includes filter tabs Semua / Belum dibaca.
 */
export function NotificationDropdown({
    children,
    notifications,
    unreadCount,
    ariaLabel = 'Notifikasi',
    emptyTitle = 'Tidak ada notifikasi baru',
    emptyText = 'Kabar terbaru akan muncul di sini',
}: NotificationDropdownProps) {
    const items = useMemo(() => notifications ?? [], [notifications]);
    const isMobile = useIsNotifMobile();
    const [mounted, setMounted] = useState(false);
    const [filter, setFilter] = useState<FilterTab>('all');
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const filteredItems = useMemo(() => {
        if (filter === 'unread') {
            return items.filter((n) => !n.is_read);
        }

        return items;
    }, [items, filter]);

    const hasItems = filteredItems.length > 0;
    const hasAnyItems = items.length > 0;
    const displayUnread = unreadCount > 99 ? '99+' : String(unreadCount);

    const markAllAsRead = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        router.post(
            '/notifications/mark-all-as-read',
            {},
            { preserveScroll: true },
        );
    };

    const header = (
        <div className="sticky top-0 z-10 flex flex-col gap-3 rounded-t-[inherit] border-b border-slate-100 bg-white px-4 py-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold leading-6 text-slate-900">
                        {ariaLabel}
                    </h3>
                    {unreadCount > 0 ? (
                        <p className="mt-0.5 text-xs leading-4 text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="inline-flex items-center rounded-full bg-[#EFF8FF] px-2 py-0.5 text-[11px] font-semibold leading-none text-[#006FE0] ring-1 ring-[#BCE0FF]">
                                    {displayUnread}
                                </span>
                                <span>belum dibaca</span>
                            </span>
                        </p>
                    ) : hasAnyItems ? (
                        <p className="mt-0.5 text-xs leading-4 text-slate-500">
                            Semua sudah dibaca
                        </p>
                    ) : (
                        <p className="mt-0.5 text-xs leading-4 text-slate-500">
                            Kabar terbaru untuk Anda
                        </p>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        type="button"
                        onClick={markAllAsRead}
                        className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap text-[#0080FF] transition duration-200 hover:bg-[#EFF8FF] hover:text-[#006FE0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,128,255,0.45)] focus-visible:ring-offset-2"
                    >
                        Tandai semua dibaca
                    </button>
                )}
            </div>

            {hasAnyItems && (
                <div
                    role="tablist"
                    aria-label="Filter notifikasi"
                    className="inline-flex w-fit items-center gap-1 rounded-full bg-slate-100 p-1"
                >
                    <button
                        role="tab"
                        aria-selected={filter === 'all'}
                        onClick={() => setFilter('all')}
                        className={
                            filter === 'all'
                                ? 'rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 transition duration-200'
                                : 'rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 transition duration-200 hover:text-slate-900'
                        }
                    >
                        Semua
                        <span className="ml-1.5 text-[11px] text-slate-500">
                            {items.length}
                        </span>
                    </button>
                    <button
                        role="tab"
                        aria-selected={filter === 'unread'}
                        onClick={() => setFilter('unread')}
                        className={
                            filter === 'unread'
                                ? 'rounded-full bg-[#0080FF] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition duration-200'
                                : 'rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 transition duration-200 hover:text-slate-900'
                        }
                    >
                        Belum dibaca
                        <span
                            className={
                                filter === 'unread'
                                    ? 'ml-1.5 text-[11px] text-white/80'
                                    : 'ml-1.5 text-[11px] text-slate-500'
                            }
                        >
                            {unreadCount}
                        </span>
                    </button>
                </div>
            )}
        </div>
    );

    const list = hasItems ? (
        <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
            {filteredItems.map((notification) => (
                <HeaderNotificationItem
                    key={notification.key}
                    notification={notification}
                />
            ))}
        </div>
    ) : hasAnyItems && filter === 'unread' ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full border border-slate-100 bg-slate-50">
                <Bell className="size-5 text-slate-400" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-slate-900">
                Tidak ada yang belum dibaca
            </p>
            <p className="mt-1 max-w-[28ch] text-xs leading-4 text-slate-500">
                Semua notifikasi sudah dibaca. Notifikasi baru akan muncul di
                sini.
            </p>
            <button
                type="button"
                onClick={() => setFilter('all')}
                className="mt-4 text-xs font-semibold text-[#0080FF] hover:text-[#006FE0]"
            >
                Lihat semua
            </button>
        </div>
    ) : (
        <div className="flex flex-1 flex-col">
            <NotificationEmptyState
                title={emptyTitle}
                description={emptyText}
            />
        </div>
    );

    const footer = hasItems ? (
        <div className="sticky bottom-0 border-t border-slate-100 bg-white px-3 py-2.5">
            <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-9 w-full rounded-xl text-sm font-semibold text-[#0080FF] hover:bg-[#EFF8FF] hover:text-[#006FE0]"
            >
                <Link href="/notifications" onClick={() => setOpen(false)}>
                    Lihat semua notifikasi
                </Link>
            </Button>
        </div>
    ) : null;

    // SSR / initial mount fallback: render DropdownMenu to avoid hydration mismatch
    if (!mounted) {
        return (
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className={desktopMenuClassName}
                    style={desktopMenuStyle}
                    sideOffset={8}
                >
                    {header}
                    {list}
                    {footer}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    // Mobile: bottom sheet 85vh
    if (isMobile) {
        return (
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>{children}</SheetTrigger>
                <SheetContent
                    side="bottom"
                    showCloseButton={false}
                    className="flex h-[85vh] max-h-[85vh] flex-col gap-0 rounded-t-[18px] border border-slate-200 bg-white p-0 shadow-[0_16px_40px_rgba(15,23,42,0.10)] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] [&>button]:hidden"
                    aria-label={ariaLabel}
                >
                    {/* Drag handle */}
                    <div className="flex justify-center pt-3 pb-2">
                        <span className="h-1.5 w-10 rounded-full bg-slate-200" />
                    </div>

                    <SheetHeader className="sr-only">
                        <SheetTitle>{ariaLabel}</SheetTitle>
                    </SheetHeader>

                    {/* Header */}
                    <div className="shrink-0">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3">
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate text-base font-semibold leading-6 text-slate-900">
                                    {ariaLabel}
                                </h3>
                                {unreadCount > 0 ? (
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        <span className="inline-flex items-center gap-1.5">
                                            <span className="inline-flex items-center rounded-full bg-[#EFF8FF] px-2 py-0.5 text-[11px] font-semibold text-[#006FE0] ring-1 ring-[#BCE0FF]">
                                                {displayUnread}
                                            </span>
                                            belum dibaca
                                        </span>
                                    </p>
                                ) : hasAnyItems ? (
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Semua sudah dibaca
                                    </p>
                                ) : null}
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={markAllAsRead}
                                        className="shrink-0 text-xs font-semibold whitespace-nowrap text-[#0080FF] hover:text-[#006FE0]"
                                    >
                                        Tandai semua dibaca
                                    </button>
                                )}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => setOpen(false)}
                                    className="size-8 shrink-0 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                    aria-label="Tutup notifikasi"
                                >
                                    <X className="size-4" />
                                </Button>
                            </div>
                        </div>
                        {hasAnyItems && (
                            <div className="border-b border-slate-100 bg-white px-4 py-2.5">
                                <div
                                    role="tablist"
                                    aria-label="Filter notifikasi"
                                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1"
                                >
                                    <button
                                        role="tab"
                                        aria-selected={filter === 'all'}
                                        onClick={() => setFilter('all')}
                                        className={
                                            filter === 'all'
                                                ? 'rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200'
                                                : 'rounded-full px-3 py-1.5 text-xs font-medium text-slate-600'
                                        }
                                    >
                                        Semua
                                        <span className="ml-1.5 text-[11px] text-slate-500">
                                            {items.length}
                                        </span>
                                    </button>
                                    <button
                                        role="tab"
                                        aria-selected={filter === 'unread'}
                                        onClick={() => setFilter('unread')}
                                        className={
                                            filter === 'unread'
                                                ? 'rounded-full bg-[#0080FF] px-3 py-1.5 text-xs font-semibold text-white shadow-sm'
                                                : 'rounded-full px-3 py-1.5 text-xs font-medium text-slate-600'
                                        }
                                    >
                                        Belum dibaca
                                        <span
                                            className={
                                                filter === 'unread'
                                                    ? 'ml-1.5 text-[11px] text-white/80'
                                                    : 'ml-1.5 text-[11px] text-slate-500'
                                            }
                                        >
                                            {unreadCount}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* List */}
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                        {list}
                    </div>

                    {/* Footer */}
                    {footer}
                </SheetContent>
            </Sheet>
        );
    }

    // Desktop: anchored dropdown
    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className={desktopMenuClassName}
                style={desktopMenuStyle}
                sideOffset={8}
            >
                {header}
                {list}
                {footer}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
