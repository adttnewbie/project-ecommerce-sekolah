import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Tone = 'blue' | 'emerald' | 'amber' | 'slate' | 'rose';

const toneMap: Record<Tone, string> = {
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    slate: 'bg-slate-100 text-slate-600',
};

type Props = {
    label: string;
    value: string | number;
    hint?: string;
    icon: LucideIcon;
    tone?: Tone;
    href?: string;
};

export function StatCard({
    label,
    value,
    hint,
    icon: Icon,
    tone = 'slate',
    href,
}: Props) {
    const content = (
        <Card
            className={cn(
                'rounded-xl border-slate-200 shadow-sm transition',
                href &&
                    'hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-md',
            )}
        >
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-500">
                            {label}
                        </p>
                        <p className="mt-2 truncate text-2xl font-semibold text-slate-900 tabular-nums">
                            {value}
                        </p>
                        {hint && (
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                {hint}
                            </p>
                        )}
                    </div>
                    <span
                        className={cn(
                            'grid size-10 shrink-0 place-items-center rounded-xl',
                            toneMap[tone],
                        )}
                    >
                        <Icon className="size-5" />
                    </span>
                </div>
            </CardContent>
        </Card>
    );

    if (href) {
        return (
            <Link
                href={href}
                className="block rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
                {content}
            </Link>
        );
    }
    return content;
}
