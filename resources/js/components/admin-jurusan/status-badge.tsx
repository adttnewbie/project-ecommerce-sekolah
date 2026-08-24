import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const styles: Record<string, string> = {
    pending_approval: 'bg-amber-50 text-amber-700 ring-amber-200',
    approved: 'bg-blue-50 text-blue-700 ring-blue-200',
    received: 'bg-sky-50 text-sky-700 ring-sky-200',
    completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
    cancelled: 'bg-slate-100 text-slate-600 ring-slate-200',
    submitted: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    not_submitted: 'bg-amber-50 text-amber-700 ring-amber-200',
    no_picket: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export function StatusBadge({
    code,
    label,
    className,
}: {
    code: string;
    label: string;
    className?: string;
}) {
    return (
        <Badge
            className={cn(
                'rounded-[6px] ring-1',
                styles[code] ?? 'bg-slate-100 text-slate-600 ring-slate-200',
                className,
            )}
        >
            {label}
        </Badge>
    );
}
