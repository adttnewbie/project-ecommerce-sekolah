import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Props = {
    badge?: string;
    badgeIcon?: LucideIcon;
    title: string;
    description: string;
    actions?: ReactNode;
    meta?: ReactNode;
    descriptionClassName?: string;
};

export function PageHeader({
    badge,
    badgeIcon: BadgeIcon,
    title,
    description,
    actions,
    meta,
    descriptionClassName,
}: Props) {
    return (
        <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                        {badge && (
                            <Badge className="mb-2 rounded-md bg-blue-50 text-blue-700">
                                {BadgeIcon && (
                                    <BadgeIcon className="size-3.5" />
                                )}
                                {badge}
                            </Badge>
                        )}
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                            {title}
                        </h1>
                        <p
                            className={cn(
                                'mt-1 max-w-2xl text-sm leading-6 text-slate-500',
                                descriptionClassName,
                            )}
                        >
                            {description}
                        </p>
                        {meta && <div className="mt-3">{meta}</div>}
                    </div>
                    {actions && (
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
