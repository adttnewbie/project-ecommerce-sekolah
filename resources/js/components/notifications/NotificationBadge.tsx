import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NotificationBadgeProps as NotificationBadgePropsType } from '@/types/notifications';

interface NotificationBadgeProps extends NotificationBadgePropsType {
    unreadCount?: number;
    onClick?: () => void;
}

export function NotificationBadge({
    unreadCount,
    onClick,
}: NotificationBadgeProps) {
    const count =
        unreadCount ??
        (typeof window !== 'undefined' ? window.__NOTIF_COUNT__ : 0);
    const displayCount = count ?? 0;
    const showBadge = displayCount > 0;

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
                'relative rounded-full text-slate-500',
                'hover:bg-slate-100 hover:text-blue-600',
                'aria-expanded:bg-slate-100 aria-expanded:text-blue-600',
            )}
            aria-label={`Notifikasi (${displayCount} tidak dibaca)`}
            onClick={onClick}
        >
            <Bell className="size-5" />

            {/* Badge with animated pulse when unread */}
            {showBadge && (
                <span className="notification-badge-pulse absolute top-2 right-2 flex size-2.5 items-center justify-center">
                    <span
                        className={cn(
                            'rounded-full ring-2 ring-white transition-all duration-200',
                            displayCount > 9
                                ? 'h-5 w-5 rounded-[8px] bg-red-500 p-1'
                                : 'bg-red-500',
                        )}
                    >
                        {displayCount > 9 && (
                            <span className="text-[10px] leading-none font-semibold text-white">
                                {Math.floor(displayCount / 10)}+
                            </span>
                        )}
                    </span>
                </span>
            )}
        </Button>
    );
}
