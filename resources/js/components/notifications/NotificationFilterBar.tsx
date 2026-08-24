import { cn } from '@/lib/utils';

export function NotificationFilterBar({
    currentFilter,
    onFilterChange,
}: {
    currentFilter: string;
    onFilterChange: (filter: string) => void;
}) {
    const filters = [
        { value: 'all', label: 'Semua' },
        { value: 'unread', label: 'Belum Dibaca' },
        { value: 'order', label: 'Pesanan' },
        { value: 'stock', label: 'Stok' },
        { value: 'product', label: 'Produk' },
    ];

    return (
        <div className="sticky top-16 z-0 border-b border-slate-200 bg-white px-4 py-3">
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
                {filters.map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => onFilterChange(filter.value)}
                        className={cn(
                            'rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-200',
                            currentFilter === filter.value
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                        )}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
