import { Link, router } from '@inertiajs/react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

import type { NotificationForDropdown } from '@/types/notifications';

const typeToBorderColors: Record<string, string> = {
    success: 'border-l-emerald-500',
    error: 'border-l-red-500',
    warning: 'border-l-amber-500',
    info: 'border-l-blue-500',
};

export function HeaderNotificationItem({
    notification,
}: {
    notification: NotificationForDropdown;
}) {
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

    const borderClass =
        typeToBorderColors[notification.type] || 'border-l-blue-500';

    return (
        <div
            className={`group flex items-start gap-3 ${borderClass} relative rounded-[6px] transition-colors duration-150 hover:bg-blue-50`}
        >
            <button
                type="button"
                onClick={dismiss}
                className="absolute top-2 right-2 z-10 -mt-1 -mr-1 rounded-lg p-1.5 text-slate-400 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-white hover:text-rose-600 focus:opacity-100"
                aria-label={`Hapus notifikasi ${notification.title}`}
            >
                <X className="size-3.5" />
            </button>
            <Link
                href={notification.href}
                className="relative z-0 flex min-w-0 flex-1 flex-col items-start gap-1 px-3 py-3 outline-none"
            >
                <span className="max-w-full truncate font-medium text-slate-900 transition-colors group-hover:text-blue-900">
                    {notification.title}
                </span>
                <span className="line-clamp-2 text-xs leading-5 text-slate-500 transition-colors group-hover:text-blue-900">
                    {notification.description}
                </span>
            </Link>
        </div>
    );
}
