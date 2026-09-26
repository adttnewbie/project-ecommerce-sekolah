import { Skeleton } from '@/components/ui/skeleton';

// Reuse skeleton kartu produk tunggal agar tidak ada duplikat visual.
export { ProductCardSkeleton } from '@/components/product/product-card-skeleton';

export function StatSkeleton() {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-8 w-24" />
            <Skeleton className="mt-2 h-3 w-36" />
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="space-y-3 p-5">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-10 w-24 rounded-lg" />
                        <Skeleton className="h-10 flex-1 rounded-lg" />
                        <Skeleton className="h-10 w-20 rounded-lg" />
                        <Skeleton className="h-8 w-20 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}
