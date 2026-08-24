import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

type Props = {
    icon: LucideIcon;
    title: string;
    description: string;
    actionHref?: string;
    actionLabel?: string;
};

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionHref,
    actionLabel,
}: Props) {
    return (
        <div className="grid place-items-center px-6 py-12 text-center">
            <span className="grid size-12 place-items-center rounded-xl bg-slate-100 text-slate-500">
                <Icon className="size-6" />
            </span>
            <p className="mt-4 text-sm font-semibold text-slate-900">{title}</p>
            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                {description}
            </p>
            {actionHref && actionLabel && (
                <Button asChild size="sm" className="mt-4 rounded-lg">
                    <Link href={actionHref}>{actionLabel}</Link>
                </Button>
            )}
        </div>
    );
}
