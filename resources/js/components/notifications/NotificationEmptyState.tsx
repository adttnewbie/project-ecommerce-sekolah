import { Bell } from 'lucide-react';

interface NotificationEmptyStateProps {
    title?: string;
    description?: string;
}

export function NotificationEmptyState({
    title = 'Tidak ada notifikasi baru',
    description = 'Anda akan melihat notifikasi di sini ketika ada pembaruan',
}: NotificationEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            {/* Bell icon */}
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-slate-50">
                <Bell className="size-8 text-slate-400" />
            </div>

            {/* Title */}
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
                {title}
            </h3>

            {/* Description */}
            <p className="max-w-md text-sm text-slate-500">{description}</p>
        </div>
    );
}
