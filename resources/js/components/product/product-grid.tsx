import { cn } from '@/lib/utils';

export const PRODUCT_GRID_CLASS_NAME =
    'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

type ProductGridProps = {
    children: React.ReactNode;
    className?: string;
};

export function ProductGrid({ children, className }: ProductGridProps) {
    return (
        <div className={cn(PRODUCT_GRID_CLASS_NAME, className)}>{children}</div>
    );
}
