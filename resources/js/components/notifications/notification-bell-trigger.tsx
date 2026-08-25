import { Bell } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type NotificationBellTriggerProps = {
    count: number;
    ariaLabel?: string;
    className?: string;
} & Omit<React.ComponentPropsWithoutRef<'button'>, 'children'>;

export const NotificationBellTrigger = React.forwardRef<
    HTMLButtonElement,
    NotificationBellTriggerProps
>(function NotificationBellTrigger(
    { count, ariaLabel = 'Notifikasi', className, ...props },
    ref,
) {
    const displayCount = count > 99 ? '99+' : String(count);
    const hasUnread = count > 0;

    return (
        <Button
            ref={ref}
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
                'relative size-11 shrink-0 rounded-full border border-transparent text-slate-500 transition duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-slate-100 hover:text-[#0080FF] focus-visible:border-[#0080FF] focus-visible:ring-3 focus-visible:ring-[#0080FF]/20 aria-expanded:bg-slate-100 aria-expanded:text-[#0080FF]',
                className,
            )}
            aria-label={
                hasUnread
                    ? `${ariaLabel} (${displayCount} belum dibaca)`
                    : ariaLabel
            }
            {...props}
        >
            <Bell className="size-5" aria-hidden="true" />
            {hasUnread && (
                <span
                    className="pointer-events-none absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-[6px] bg-[#DC2626] px-1 text-[10px] leading-none font-semibold text-white ring-2 ring-white"
                    aria-hidden="true"
                >
                    {displayCount}
                </span>
            )}
        </Button>
    );
});

NotificationBellTrigger.displayName = 'NotificationBellTrigger';
