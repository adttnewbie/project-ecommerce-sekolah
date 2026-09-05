import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductCardSkeleton() {
    return (
        <Card className="flex h-full flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white py-0 shadow-sm">
            <Skeleton className="aspect-square w-full rounded-none" />
            <CardHeader className="space-y-2 p-2.5">
                <div className="flex gap-1.5">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <div className="space-y-1.5">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
                <Skeleton className="h-3 w-2/3" />
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-1.5 p-2.5 pt-0">
                <Skeleton className="h-5 w-24" />
                <div className="mt-auto flex items-center justify-between gap-1.5 border-t border-slate-100 pt-2.5">
                    <Skeleton className="h-3 w-16" />
                    <div className="flex items-center gap-1">
                        <Skeleton className="h-9 w-9 rounded-[10px]" />
                        <Skeleton className="h-9 w-14 rounded-[10px]" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}
