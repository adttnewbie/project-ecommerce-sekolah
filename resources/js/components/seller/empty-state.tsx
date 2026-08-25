import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
    icon: LucideIcon;
    title: string;
    description: string;
    actionHref?: string;
    actionLabel?: string;
    secondaryActionHref?: string;
    secondaryActionLabel?: string;
};

export function SellerEmptyState({
    icon: Icon,
    title,
    description,
    actionHref,
    actionLabel,
    secondaryActionHref,
    secondaryActionLabel,
}: Props) {
    return (
        <div className="grid place-items-center px-6 py-12 text-center">
            <span className="grid size-12 place-items-center rounded-[14px] bg-[#EFF8FF] text-[#0080FF] ring-1 ring-[#BCE0FF]" aria-hidden="true">
                <Icon className="size-6" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
            {(actionHref && actionLabel) || (secondaryActionHref && secondaryActionLabel) ? (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {actionHref && actionLabel && (
                        <Button
                            asChild
                            className="h-11 min-h-11 rounded-[12px] px-5 font-semibold transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                        >
                            <Link href={actionHref} aria-label={actionLabel}>
                                {actionLabel}
                            </Link>
                        </Button>
                    )}
                    {secondaryActionHref && secondaryActionLabel && (
                        <Button
                            asChild
                            variant="outline"
                            className="h-11 min-h-11 rounded-[12px] border-slate-200 bg-white font-semibold transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                        >
                            <Link
                                href={secondaryActionHref}
                                aria-label={secondaryActionLabel}
                            >
                                {secondaryActionLabel}
                            </Link>
                        </Button>
                    )}
                </div>
            ) : null}
        </div>
    );
}
