export function NotificationSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-0" aria-hidden="true">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-start gap-3 border-b border-slate-50 px-4 py-3.5 last:border-0"
                >
                    <div className="size-9 shrink-0 animate-pulse rounded-full bg-slate-100" />
                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-3.5 w-3/4 animate-pulse rounded-full bg-slate-100" />
                        <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
                        <div className="h-2.5 w-24 animate-pulse rounded-full bg-slate-100" />
                    </div>
                    <div className="size-8 shrink-0 animate-pulse rounded-full bg-slate-100" />
                </div>
            ))}
        </div>
    );
}
