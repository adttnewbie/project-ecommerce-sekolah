import { router, usePage } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { NotificationEmptyState } from '@/components/notifications/NotificationEmptyState';
import { NotificationFilterBar } from '@/components/notifications/NotificationFilterBar';
import { NotificationGroup } from '@/components/notifications/NotificationGroup';
import { Button } from '@/components/ui/button';
import { groupNotificationsByDate } from '@/lib/formatNotificationTimestamp';
import type { PaginatedNotifications } from '@/types/notifications';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

const toasts = {
    success(message: string) {
        const id = Math.random().toString(36).substring(7);
        window.__toasts__ = window.__toasts__ || [];
        window.__toasts__.push({ id, message, type: 'success' as const });
        setTimeout(() => {
            const updatedToasts = window.__toasts__ ?? [];
            window.__toasts__ = updatedToasts.filter((t: Toast) => t.id !== id);
        }, 4000);
    },
};

export default function NotificationsPage() {
    const props = usePage().props.data as PaginatedNotifications & {
        unreadCount: number;
    };

    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [filter, setFilter] = useState(props.filter || 'all');

    // Mark all as read
    const handleMarkAllAsRead = useCallback(() => {
        router.post(
            '/notifications/mark-all-as-read',
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toasts.success('Semua notifikasi ditandai sebagai dibaca');
                },
                onError: () => {
                    toasts.success('Gagal menandai semua sebagai dibaca');
                },
            },
        );
    }, []);

    // Batch mark selected as read
    const handleBatchMarkAsRead = useCallback(() => {
        if (selectedKeys.length === 0) {
            return;
        }

        router.post(
            '/notifications/batch-read',
            { keys: selectedKeys },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedKeys([]);
                    toasts.success(
                        `${selectedKeys.length} notifikasi ditandai sebagai dibaca`,
                    );
                },
                onError: () => {
                    toasts.success('Gagal menandai notifikasi sebagai dibaca');
                },
            },
        );
    }, [selectedKeys]);

    // Get filtered notifications
    const getFilteredNotifications = (): Array<
        PaginatedNotifications['notifications'][number]
    > => {
        const base = props.notifications;

        if (filter === 'unread') {
            return base.filter((n) => !n.is_read);
        }

        if (filter === 'read') {
            return base.filter((n) => n.is_read);
        }

        if (
            [
                'order',
                'stock',
                'product',
                'payment',
                'system',
                'promotion',
            ].includes(filter)
        ) {
            return base.filter((n) => n.type === filter);
        }

        return base;
    };

    const filteredNotifications = getFilteredNotifications();
    const groupedNotifications = groupNotificationsByDate(
        filteredNotifications,
    );

    const hasUnread = filteredNotifications.some((n) => !n.is_read);
    const hasSelected = selectedKeys.length > 0;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sticky Header */}
            <header className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
                <div className="mx-auto max-w-3xl px-4 sm:px-6">
                    {/* Title bar */}
                    <div className="flex h-16 items-center justify-between px-4">
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Notifikasi
                        </h1>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                            {hasUnread && (
                                <Button
                                    onClick={handleMarkAllAsRead}
                                    size="sm"
                                    className="hidden sm:inline-flex"
                                >
                                    <CheckCircle2 className="mr-2 size-4" />
                                    Tandai Semua Dibaca
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Filter bar */}
                    <NotificationFilterBar
                        currentFilter={filter}
                        onFilterChange={setFilter}
                    />
                </div>
            </header>

            {/* Batch action bar (only when items selected) */}
            {hasSelected && (
                <div className="sticky top-36 z-10 bg-blue-600 text-white shadow-lg">
                    <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
                        <span className="font-medium">
                            {selectedKeys.length} notifikasi dipilih
                        </span>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleBatchMarkAsRead}
                                size="sm"
                                variant="secondary"
                                className="bg-white text-blue-600 hover:bg-slate-100"
                            >
                                <CheckCircle2 className="mr-2 size-4" />
                                Tandai Dibaca
                            </Button>
                            <button
                                onClick={() => setSelectedKeys([])}
                                className="rounded-lg p-2 transition-colors hover:bg-blue-700"
                                aria-label="Batalkan pemilihan"
                            >
                                <svg
                                    className="size-5"
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
                        </div>
                    </div>
                </div>
            )}

            {/* Main content */}
            <main className="mx-auto max-w-3xl py-6">
                {filteredNotifications.length > 0 ? (
                    <>
                        {groupedNotifications.map((group) => (
                            <NotificationGroup
                                key={group.label}
                                label={group.label}
                                items={[...group.items]}
                            />
                        ))}
                    </>
                ) : (
                    <NotificationEmptyState
                        title={
                            filter === 'unread'
                                ? 'Tidak ada notifikasi yang belum dibaca'
                                : filter === 'read'
                                  ? 'Tidak ada notifikasi yang sudah dibaca'
                                  : `Tidak ada notifikasi ${filter}`
                        }
                        description="Coba ubah filter untuk melihat notifikasi lain"
                    />
                )}

                {/* Pagination info */}
                {props.meta.total > 0 && (
                    <div className="mt-8 px-4 text-center">
                        <p className="text-sm text-slate-500">
                            Menampilkan {props.meta.from}–{props.meta.to} dari{' '}
                            {props.meta.total} notifikasi
                        </p>

                        {/* Simple pagination controls */}
                        {props.meta.last_page > 1 && (
                            <div className="mt-4 flex justify-center gap-2">
                                <Button
                                    onClick={() =>
                                        router.get(
                                            '/notifications?page=' +
                                                (props.meta.current_page - 1),
                                            {},
                                            { preserveState: true },
                                        )
                                    }
                                    disabled={props.meta.current_page <= 1}
                                    size="sm"
                                    variant="outline"
                                >
                                    Sebelumnya
                                </Button>

                                <span className="px-4 py-2 text-sm text-slate-600">
                                    Halaman {props.meta.current_page} /{' '}
                                    {props.meta.last_page}
                                </span>

                                <Button
                                    onClick={() =>
                                        router.get(
                                            '/notifications?page=' +
                                                (props.meta.current_page + 1),
                                            {},
                                            { preserveState: true },
                                        )
                                    }
                                    disabled={
                                        props.meta.current_page >=
                                        props.meta.last_page
                                    }
                                    size="sm"
                                    variant="outline"
                                >
                                    Selanjutnya
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Toast Notifications */}
            <ToastContainer />
        </div>
    );
}

function ToastContainer() {
    const [toastsList, setToasts] = useState<(Toast & { id: string })[]>([]);

    useEffect(() => {
        const updateToasts = () => {
            setToasts(window.__toasts__ ?? []);
        };

        updateToasts();
        const interval = setInterval(updateToasts, 100);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="pointer-events-none fixed right-4 bottom-4 z-50 space-y-2">
            {toastsList.map((toast) => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto max-w-sm translate-y-0 transform rounded-lg px-4 py-3 opacity-100 shadow-lg transition-all duration-300 ${
                        toast.type === 'success'
                            ? 'bg-green-600 text-white'
                            : toast.type === 'error'
                              ? 'bg-red-600 text-white'
                              : 'bg-blue-600 text-white'
                    }`}
                >
                    <p className="text-sm font-medium">{toast.message}</p>
                </div>
            ))}
        </div>
    );
}
