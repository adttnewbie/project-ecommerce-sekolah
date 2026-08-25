import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowUpDown, Boxes, PackageCheck, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { SellerEmptyState } from '@/components/seller/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
    index as inventoryIndex,
    update as inventoryUpdate,
} from '@/routes/seller/inventory';
import { create as sellerProductsCreate } from '@/routes/seller/products';

type ProductStatus = 'draft' | 'pending' | 'approved' | 'rejected';

type InventoryProduct = {
    id: number;
    name: string;
    slug: string;
    image: string | null;
    status: { code: ProductStatus; label: string };
    stock: number;
    category: { id: number; name: string; slug: string };
    is_low_stock: boolean;
    is_out_of_stock: boolean;
};

type InventoryProps = {
    products: {
        data: InventoryProduct[];
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    summary: { total: number; low_stock: number; out_of_stock: number };
    filters: { q: string; stock: string };
};

const statusStyles: Record<ProductStatus, string> = {
    draft: 'bg-slate-100 text-slate-700 border border-slate-200',
    pending: 'bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]',
    approved: 'bg-[#ECFDF3] text-[#16A34A] border border-[#BBF7D0]',
    rejected: 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]',
};

type SortKey = 'name' | 'stock' | 'status';
type SortOrder = 'asc' | 'desc';

export default function SellerInventoryIndex({
    products,
    summary,
    filters,
}: InventoryProps) {
    const { flash } = usePage().props as {
        flash: { success?: string; error?: string };
    };
    const [q, setQ] = useState(filters.q);
    const [stockFilter, setStockFilter] = useState(filters.stock || '');
    const [selected, setSelected] = useState<InventoryProduct | null>(null);
    const [stock, setStock] = useState('0');
    const [stockError, setStockError] = useState<string>();
    const [processing, setProcessing] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [sortKey, setSortKey] = useState<SortKey | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    const openStockEditor = (product: InventoryProduct) => {
        setSelected(product);
        setStock(String(product.stock));
        setStockError(undefined);
    };

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const sortedData = useMemo(() => {
        if (!sortKey) {
            return products.data;
        }
        const copy = [...products.data];
        copy.sort((a, b) => {
            let aVal: string | number = '';
            let bVal: string | number = '';
            switch (sortKey) {
                case 'name':
                    aVal = a.name.toLowerCase();
                    bVal = b.name.toLowerCase();
                    break;
                case 'stock':
                    aVal = a.stock;
                    bVal = b.stock;
                    break;
                case 'status':
                    aVal = a.status.label.toLowerCase();
                    bVal = b.status.label.toLowerCase();
                    break;
                default:
                    break;
            }
            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        return copy;
    }, [products.data, sortKey, sortOrder]);

    const submitFilters = (event: React.FormEvent) => {
        event.preventDefault();
        setIsFiltering(true);
        router.get(
            inventoryIndex(),
            Object.fromEntries(
                Object.entries({
                    q,
                    stock: stockFilter === 'all' ? '' : stockFilter,
                }).filter(([, value]) => value),
            ),
            { preserveState: true, replace: true, onFinish: () => setIsFiltering(false) },
        );
    };

    const resetFilters = () => {
        setQ('');
        setStockFilter('');
        setIsFiltering(true);
        router.get(inventoryIndex().url, undefined, {
            onFinish: () => setIsFiltering(false),
        });
    };

    const updateStock = (event: React.FormEvent) => {
        event.preventDefault();

        if (!selected) {
            return;
        }

        router.patch(
            inventoryUpdate(selected.id),
            { stock },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: () => setSelected(null),
                onError: (errors) => setStockError((errors as Record<string, string>).stock),
            },
        );
    };

    const summaries = [
        {
            label: 'Total Produk',
            value: summary.total,
            tone: 'text-[#0080FF]',
            wrapper: 'bg-[#EFF8FF] text-[#0080FF] border-[#BCE0FF]',
            icon: Boxes,
        },
        {
            label: 'Stok Rendah',
            value: summary.low_stock,
            tone: 'text-[#EA580C]',
            wrapper: 'bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]',
            icon: AlertTriangle,
        },
        {
            label: 'Stok Habis',
            value: summary.out_of_stock,
            tone: 'text-[#DC2626]',
            wrapper: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
            icon: PackageCheck,
        },
    ];

    const isEmpty = !isFiltering && sortedData.length === 0;
    const columns: { key: SortKey | 'category' | 'condition' | 'actions'; label: string; sortable: boolean }[] = [
        { key: 'name', label: 'Produk', sortable: true },
        { key: 'category', label: 'Kategori', sortable: false },
        { key: 'status', label: 'Moderasi', sortable: true },
        { key: 'stock', label: 'Stok', sortable: true },
        { key: 'condition', label: 'Kondisi', sortable: false },
        { key: 'actions', label: 'Aksi', sortable: false },
    ];

    return (
        <>
            <Head title="Inventori" />
            <main className="min-h-[calc(100svh-4rem)] bg-slate-50 p-4 sm:p-6">
                <div className="space-y-6">
                    <section>
                        <Badge className="mb-2 rounded-[6px] border border-[#BCE0FF] bg-[#EFF8FF] text-[#0080FF]">
                            <Boxes className="size-3.5" aria-hidden="true" /> Seller Center
                        </Badge>
                        <h1 className="text-2xl font-semibold text-slate-950">
                            Inventori
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Pantau dan perbarui stok produk toko.
                        </p>
                    </section>

                    {(flash.success || flash.error) && (
                        <div
                            role="status"
                            className={cn(
                                'rounded-[14px] border px-4 py-3 text-sm shadow-sm transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
                                flash.error
                                    ? 'border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]'
                                    : 'border-[#BBF7D0] bg-[#ECFDF3] text-[#16A34A]',
                            )}
                        >
                            {flash.error || flash.success}
                        </div>
                    )}

                    <section className="grid gap-4 sm:grid-cols-3">
                        {summaries.map(({ label, value, tone, wrapper, icon: Icon }) => (
                            <Card
                                key={label}
                                className="rounded-[14px] border-slate-100 shadow-sm transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-md motion-reduce:transition-none motion-reduce:hover:shadow-sm"
                            >
                                <CardContent className="flex items-center justify-between p-5">
                                    <div>
                                        <p className="text-sm text-slate-500">
                                            {label}
                                        </p>
                                        <p
                                            className={cn(
                                                'mt-1 text-2xl font-semibold tabular-nums',
                                                tone,
                                            )}
                                        >
                                            {value}
                                        </p>
                                    </div>
                                    <span
                                        className={cn(
                                            'grid size-10 place-items-center rounded-[10px] border',
                                            wrapper,
                                        )}
                                        aria-hidden="true"
                                    >
                                        <Icon className="size-5" aria-hidden="true" />
                                    </span>
                                </CardContent>
                            </Card>
                        ))}
                    </section>

                    <Card className="gap-0 overflow-hidden rounded-[14px] border-slate-100 py-0 shadow-sm transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-md motion-reduce:transition-none motion-reduce:hover:shadow-sm">
                        <CardHeader className="border-b border-slate-100 p-5">
                            <CardTitle>Daftar Stok</CardTitle>
                            <CardDescription>
                                {products.from ?? 0}-{products.to ?? 0} dari{' '}
                                {products.total} produk
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <form
                                onSubmit={submitFilters}
                                className="grid gap-3 border-b border-slate-100 p-5 sm:grid-cols-[1fr_12rem_auto]"
                            >
                                <label className="relative">
                                    <span className="sr-only">Cari produk</span>
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                                    <Input
                                        value={q}
                                        onChange={(event) =>
                                            setQ(event.target.value)
                                        }
                                        placeholder="Cari produk"
                                        aria-describedby="q-error"
                                        className="h-11 rounded-[10px] border-slate-200 bg-white pl-9 shadow-none transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:border-[#0080FF] focus-visible:ring-2 focus-visible:ring-[#0080FF]/20"
                                    />
                                    <span id="q-error" className="sr-only" aria-live="polite" />
                                </label>
                                <label>
                                    <span className="sr-only">
                                        Kondisi stok
                                    </span>
                                    <Select
                                        value={stockFilter}
                                        onValueChange={setStockFilter}
                                    >
                                        <SelectTrigger aria-label="Filter kondisi stok" className="h-11 w-full rounded-[10px] border-slate-200 bg-white shadow-none transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:border-[#0080FF] focus-visible:ring-2 focus-visible:ring-[#0080FF]/20">
                                            <SelectValue placeholder="Pilih kondisi stok" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-[14px] bg-white text-slate-900 ring-slate-200 shadow-lg">
                                            <SelectGroup>
                                                <SelectLabel>
                                                    Kondisi stok
                                                </SelectLabel>
                                                <SelectItem value="all">
                                                    Semua stok
                                                </SelectItem>
                                                <SelectItem value="low">
                                                    Stok rendah
                                                </SelectItem>
                                                <SelectItem value="out">
                                                    Stok habis
                                                </SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </label>
                                <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        disabled={isFiltering}
                                        className="h-11 rounded-[12px] px-5 font-semibold transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                                    >
                                        {isFiltering && <Spinner className="size-4" aria-hidden="true" />}
                                        Terapkan
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={resetFilters}
                                        className="h-11 rounded-[12px] border-slate-200 bg-white px-5 font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </form>

                            {/* Desktop table */}
                            <div className="hidden overflow-x-auto md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                                            {columns.map((col) => (
                                                <TableHead
                                                    key={col.label}
                                                    className="px-5"
                                                    aria-sort={
                                                        sortKey === col.key
                                                            ? sortOrder === 'asc'
                                                                ? 'ascending'
                                                                : 'descending'
                                                            : undefined
                                                    }
                                                >
                                                    {col.sortable ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSort(col.key as SortKey)}
                                                            className="inline-flex items-center gap-1.5 font-semibold text-slate-500 hover:text-slate-900 transition-colors duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2 rounded-[6px] px-1 -mx-1"
                                                            aria-label={`Urutkan ${col.label} ${sortKey === col.key ? (sortOrder === 'asc' ? 'menaik' : 'menurun') : ''}`}
                                                        >
                                                            {col.label}
                                                            <ArrowUpDown
                                                                className={cn(
                                                                    'size-3.5 shrink-0 transition-colors duration-[180ms]',
                                                                    sortKey === col.key
                                                                        ? 'text-[#0080FF]'
                                                                        : 'text-slate-400',
                                                                )}
                                                                aria-hidden="true"
                                                            />
                                                        </button>
                                                    ) : (
                                                        col.label
                                                    )}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isFiltering ? (
                                            Array.from({ length: 5 }).map((_, idx) => (
                                                <TableRow key={`skeleton-${idx}`}>
                                                    <TableCell className="px-5">
                                                        <div className="space-y-2 py-1">
                                                            <Skeleton className="h-4 w-40 rounded-[6px] motion-reduce:animate-none" aria-hidden="true" />
                                                            <Skeleton className="h-3 w-24 rounded-[6px] motion-reduce:animate-none" aria-hidden="true" />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <Skeleton className="h-4 w-24 rounded-[6px] motion-reduce:animate-none" aria-hidden="true" />
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <Skeleton className="h-5 w-20 rounded-full motion-reduce:animate-none" aria-hidden="true" />
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <Skeleton className="h-5 w-16 rounded-[6px] motion-reduce:animate-none" aria-hidden="true" />
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <Skeleton className="h-5 w-16 rounded-full motion-reduce:animate-none" aria-hidden="true" />
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <div className="flex justify-end">
                                                            <Skeleton className="h-11 w-24 rounded-[12px] motion-reduce:animate-none" aria-hidden="true" />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : isEmpty ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="p-0">
                                                    <SellerEmptyState
                                                        icon={Boxes}
                                                        title="Tidak ada produk"
                                                        description="Tidak ada produk yang sesuai filter. Coba ubah kata kunci pencarian atau tambah produk baru untuk mulai mengelola stok."
                                                        actionHref={sellerProductsCreate().url}
                                                        actionLabel="Tambah Produk"
                                                        secondaryActionHref={inventoryIndex().url}
                                                        secondaryActionLabel="Reset"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            sortedData.map((product) => (
                                                <TableRow key={product.id} className="transition-colors duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none">
                                                    <TableCell className="min-w-56 px-5 font-medium">
                                                        <p className="max-w-[20ch] truncate font-semibold text-slate-950" title={product.name}>
                                                            {product.name}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="px-5 text-slate-600">
                                                        {product.category.name}
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <Badge
                                                            className={cn(
                                                                'rounded-full px-2.5 py-0.5 font-medium',
                                                                statusStyles[
                                                                    product.status
                                                                        .code
                                                                ],
                                                            )}
                                                        >
                                                            {product.status.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-5 text-lg font-semibold tabular-nums text-slate-900">
                                                        {product.stock}
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <Badge
                                                            className={cn(
                                                                'rounded-full px-2.5 py-0.5 font-medium',
                                                                product.is_out_of_stock
                                                                    ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                                                                    : product.is_low_stock
                                                                      ? 'bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]'
                                                                      : 'bg-[#ECFDF3] text-[#16A34A] border border-[#BBF7D0]',
                                                            )}
                                                        >
                                                            {product.is_out_of_stock
                                                                ? 'Habis'
                                                                : product.is_low_stock
                                                                  ? 'Rendah'
                                                                  : 'Aman'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-5 text-right">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="h-11 rounded-[12px] border-slate-200 bg-white px-4 font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                                                            onClick={() =>
                                                                openStockEditor(
                                                                    product,
                                                                )
                                                            }
                                                            aria-label={`Edit stok ${product.name}`}
                                                        >
                                                            Edit stok
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile card-list fallback */}
                            <div className="grid gap-4 p-4 md:hidden">
                                {isFiltering ? (
                                    Array.from({ length: 5 }).map((_, idx) => (
                                        <Card
                                            key={`mobile-skeleton-${idx}`}
                                            className="rounded-[14px] border-slate-100 p-4 shadow-sm"
                                            aria-hidden="true"
                                        >
                                            <div className="space-y-3">
                                                <Skeleton className="h-4 w-3/4 rounded-[6px] motion-reduce:animate-none" />
                                                <Skeleton className="h-3 w-1/2 rounded-[6px] motion-reduce:animate-none" />
                                                <div className="flex gap-2">
                                                    <Skeleton className="h-5 w-16 rounded-full motion-reduce:animate-none" />
                                                    <Skeleton className="h-5 w-16 rounded-full motion-reduce:animate-none" />
                                                </div>
                                                <div className="flex gap-2 pt-1">
                                                    <Skeleton className="h-5 w-12 rounded-[6px] motion-reduce:animate-none" />
                                                    <Skeleton className="h-5 w-12 rounded-[6px] motion-reduce:animate-none" />
                                                </div>
                                                <Skeleton className="h-11 w-full rounded-[12px] motion-reduce:animate-none" />
                                            </div>
                                        </Card>
                                    ))
                                ) : isEmpty ? (
                                    <div className="rounded-[14px] border border-slate-100 bg-white shadow-sm">
                                        <SellerEmptyState
                                            icon={Boxes}
                                            title="Tidak ada produk"
                                            description="Tidak ada produk yang sesuai filter. Coba ubah kata kunci pencarian atau tambah produk baru untuk mulai mengelola stok."
                                            actionHref={sellerProductsCreate().url}
                                            actionLabel="Tambah Produk"
                                            secondaryActionHref={inventoryIndex().url}
                                            secondaryActionLabel="Reset"
                                        />
                                    </div>
                                ) : (
                                    sortedData.map((product) => (
                                        <Card
                                            key={`mobile-${product.id}`}
                                            className="rounded-[14px] border-slate-100 p-4 shadow-sm transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-md motion-reduce:transition-none"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-slate-950" title={product.name}>
                                                        {product.name}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {product.category.name}
                                                    </p>
                                                </div>
                                                <Badge className={cn('shrink-0 rounded-full font-medium', statusStyles[product.status.code])}>
                                                    {product.status.label}
                                                </Badge>
                                            </div>
                                            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                                                <span className="font-semibold tabular-nums text-slate-900">Stok {product.stock}</span>
                                                <span className="text-slate-300" aria-hidden="true">•</span>
                                                <Badge
                                                    className={cn(
                                                        'rounded-full font-medium',
                                                        product.is_out_of_stock
                                                            ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                                                            : product.is_low_stock
                                                              ? 'bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]'
                                                              : 'bg-[#ECFDF3] text-[#16A34A] border border-[#BBF7D0]',
                                                    )}
                                                >
                                                    {product.is_out_of_stock ? 'Habis' : product.is_low_stock ? 'Rendah' : 'Aman'}
                                                </Badge>
                                            </div>
                                            <div className="mt-4">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => openStockEditor(product)}
                                                    className="h-11 w-full rounded-[12px] border-slate-200 bg-white font-semibold transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                                                    aria-label={`Edit stok ${product.name}`}
                                                >
                                                    Edit stok
                                                </Button>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>

                            {products.last_page > 1 && (
                                <div className="flex items-center justify-between border-t border-slate-100 p-4">
                                    <span className="text-sm text-slate-500">
                                        Halaman {products.current_page} dari{' '}
                                        {products.last_page}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button
                                            asChild={Boolean(
                                                products.prev_page_url,
                                            )}
                                            disabled={!products.prev_page_url}
                                            variant="outline"
                                            className="h-11 rounded-[12px] border-slate-200 bg-white px-4 font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2 disabled:opacity-50"
                                        >
                                            {products.prev_page_url ? (
                                                <Link
                                                    href={
                                                        products.prev_page_url
                                                    }
                                                >
                                                    Sebelumnya
                                                </Link>
                                            ) : (
                                                <span>Sebelumnya</span>
                                            )}
                                        </Button>
                                        <Button
                                            asChild={Boolean(
                                                products.next_page_url,
                                            )}
                                            disabled={!products.next_page_url}
                                            variant="outline"
                                            className="h-11 rounded-[12px] border-slate-200 bg-white px-4 font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2 disabled:opacity-50"
                                        >
                                            {products.next_page_url ? (
                                                <Link
                                                    href={
                                                        products.next_page_url
                                                    }
                                                >
                                                    Berikutnya
                                                </Link>
                                            ) : (
                                                <span>Berikutnya</span>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Dialog
                open={Boolean(selected)}
                onOpenChange={(open) =>
                    !open && !processing && setSelected(null)
                }
            >
                <DialogContent
                    className="rounded-[18px] border-slate-200 bg-white p-6 shadow-lg duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                    showCloseButton={!processing}
                    aria-describedby="stock-dialog-desc"
                >
                    <DialogHeader>
                        <DialogTitle>Edit stok</DialogTitle>
                        <DialogDescription id="stock-dialog-desc">
                            Perbarui stok {selected?.name}. Status moderasi
                            produk tidak berubah.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={updateStock} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="stock">Jumlah stok</Label>
                            <Input
                                id="stock"
                                type="number"
                                min={0}
                                max={100000}
                                required
                                value={stock}
                                onChange={(event) =>
                                    setStock(event.target.value)
                                }
                                aria-invalid={Boolean(stockError)}
                                aria-describedby={stockError ? 'stock-error' : undefined}
                                className="h-11 rounded-[10px] border-slate-200 bg-white shadow-none transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:border-[#0080FF] focus-visible:ring-2 focus-visible:ring-[#0080FF]/20"
                            />
                            <InputError message={stockError} id="stock-error" />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={processing}
                                    className="h-11 rounded-[12px] border-slate-200 bg-white font-semibold transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                                >
                                    Batal
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={processing} className="h-11 rounded-[12px] font-semibold transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2" aria-busy={processing}>
                                {processing && <Spinner className="size-4" aria-hidden="true" />}
                                {processing ? 'Menyimpan...' : 'Simpan stok'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

SellerInventoryIndex.layout = {
    breadcrumbs: [{ title: 'Inventori', href: inventoryIndex() }],
};
