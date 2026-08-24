import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { NotificationForDropdown } from '@/types/notifications';
import { NotificationEmptyState } from './NotificationEmptyState';
import { NotificationItem } from './NotificationItem';

interface NotificationSheetProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: NotificationForDropdown[];
    onMarkAsRead?: (key: string) => void;
    onDismiss?: (key: string) => void;
}

export function NotificationSheet({
    isOpen,
    onClose,
    notifications,
    onMarkAsRead,
    onDismiss,
}: NotificationSheetProps) {
    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="fixed bottom-0 left-1/2 z-50 h-[90vh] w-full max-w-lg -translate-x-1/2 rounded-t-2xl border-none p-0 shadow-xl sm:right-4 sm:left-auto sm:-translate-x-0">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Notifikasi
                        </h2>
                        {unreadCount > 0 && (
                            <p className="mt-0.5 text-xs text-slate-500">
                                {unreadCount} tidak dibaca
                            </p>
                        )}
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="-mr-1 h-8 w-8 rounded-full"
                        aria-label="Tutup notifikasi"
                    >
                        <X className="size-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {notifications.length > 0 ? (
                        <div className="space-y-1">
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.key}
                                    notification={{
                                        id: notification.id ?? 0,
                                        key: notification.key,
                                        type: notification.type,
                                        title: notification.title,
                                        description: notification.description,
                                        href: notification.href,
                                        is_read: notification.is_read,
                                        created_at: notification.created_at,
                                    }}
                                    onMarkAsRead={onMarkAsRead}
                                    onDismiss={onDismiss}
                                    showActions={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <NotificationEmptyState
                            title="Tidak ada notifikasi baru"
                            description="Anda akan melihat notifikasi di sini ketika ada pembaruan"
                        />
                    )}
                </div>

                {/* Footer with swipe hint */}
                <div className="border-t border-slate-200 bg-white px-4 py-3 text-center">
                    <p className="text-xs text-slate-400">
                        Ketuk notifikasi untuk melihat detail • Geser ke bawah
                        untuk menutup
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
