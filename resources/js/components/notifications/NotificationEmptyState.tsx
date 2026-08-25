import { Link } from '@inertiajs/react';
import { Bell } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface NotificationEmptyStateProps {
    title?: string;
    description?: string;
    ctaLabel?: string;
    ctaHref?: string;
}

export function NotificationEmptyState({
    title = 'Tidak ada notifikasi baru',
    description = 'Anda akan melihat notifikasi di sini ketika ada pembaruan',
    ctaLabel,
    ctaHref,
}: NotificationEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            {/* Icon — slate-50, 64px wrapper, 20-24px icon per design.md */}
            <div className="mb-4 flex size-16 items-center justify-center rounded-full border border-slate-100 bg-slate-50">
                <Bell className="size-6 text-slate-400" aria-hidden="true" />
            </div>

            {/* Title — H4 20/600 slate-900 */}
            <h3 className="mb-1.5 text-base font-semibold leading-6 text-slate-900">
                {title}
            </h3>

            {/* Description — Body Small 14 slate-600 */}
            <p className="max-w-[32ch] text-sm leading-5 text-slate-600">
                {description}
            </p>

            {ctaLabel && ctaHref && (
                <Button
                    asChild
                    size="sm"
                    className="mt-5 h-9 rounded-xl bg-[#0080FF] px-4 text-sm font-semibold text-white hover:bg-[#006FE0]"
                >
                    <Link href={ctaHref}>{ctaLabel}</Link>
                </Button>
            )}
        </div>
    );
}
