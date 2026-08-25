import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowUpDown,
    CheckCircle2,
    Clock3,
    Package,
    Pencil,
    Plus,
    Search,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
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
    create as sellerProductsCreate,
    destroy as sellerProductsDestroy,
    edit as sellerProductsEdit,
    index as sellerProductsIndex,
} from '@/routes/seller/products';

type ProductStatus = 'draft' | 'pending' | 'approved' | 'rejected';

type SellerProduct = {
    id: number;
    name: string;
    slug: string;
    category: { id: number; name: string; slug: string };
    price: number;
    stock: number;
    is_pre_order: boolean;
    fulfillment_type: { code: 'ready_stock' | 'pre_order'; label: string };
    pre_order_estimate_days: number | null;
    pre_order_deadline: string | null;
    pre_order_min_quantity: number | null;
    status: { code: ProductStatus; label: string };
};

type Paginator<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
    from: number | null;
    to: number | null;
    total: number;
};

type SellerProductsIndexProps = {
    products: Paginator<SellerProduct>;
    categories: { id: number; name: string; slug: string }[];
    filters: {
        q: string;
        status: string;
        category_id: string | number;
        stock: string;
    };
};

const statusStyles: Record<ProductStatus, string> = {
    draft: 'bg-slate-100 text-slate-700 border border-slate-200',
    pending: 'bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]',
    approved: 'bg-[#ECFDF3] text-[#16A34A] border border-[#BBF7D0]',
    rejected: 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]',
};

const statusIcons: Record<ProductStatus, typeof Clock3> = {
    draft: Clock3,
    pending: Clock3,
    approved: CheckCircle2,
    rejected: XCircle,
};

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

type SortKey = 'name' | 'category' | 'price' | 'stock' | 'status';
type SortOrder = 'asc' | 'desc';

export default function SellerProductsIndex({
    products,
    categories,
    filters,
}: SellerProductsIndexProps) {
    const { flash } = usePage().props as {
        flash: { success?: string; error?: string };
    };
    const [q, setQ] = useState(filters.q);
    const [status, setStatus] = useState(filters.status || '');
    const [categoryId, setCategoryId] = useState(
        String(filters.category_id || ''),
    );
    const [stock, setStock] = useState(filters.stock || '');
    const [selected, setSelected] = useState<SellerProduct | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string>();
    const [sortKey, setSortKey] = useState<SortKey | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [isFiltering, setIsFiltering] = useState(false);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
        // UI-only state; keeps query param handling optional.
        // To sync with backend, uncomment:
        // router.get(
        //     sellerProductsIndex(),
        //     { ...filters, sort: key, order: sortKey === key ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc' },
        //     { preserveState: true, replace: true },
        // );
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
                case 'category':
                    aVal = a.category.name.toLowerCase();
                    bVal = b.category.name.toLowerCase();
                    break;
                case 'price':
                    aVal = a.price;
                    bVal = b.price;
                    break;
                case 'stock':
                    aVal = a.is_pre_order ? -1 : a.stock;
                    bVal = b.is_pre_order ? -1 : b.stock;
                    break;
                case 'status':
                    aVal = a.status.label.toLowerCase();
                    bVal = b.status.label.toLowerCase();
                    break;
                default:
                    break;
            }

            if (aVal < bVal) {
return sortOrder === 'asc' ? -1 : 1;
}

            if (aVal > bVal) {
return sortOrder === 'asc' ? 1 : -1;
}

            return 0;
        });

        return copy;
    }, [products.data, sortKey, sortOrder]);

    const submitFilters = (event: React.FormEvent) => {
        event.preventDefault();
        setIsFiltering(true);
        router.get(
            sellerProductsIndex(),
            Object.fromEntries(
                Object.entries({
                    q,
                    status: status === 'all' ? '' : status,
                    category_id: categoryId === 'all' ? '' : categoryId,
                    stock: stock === 'all' ? '' : stock,
                }).filter(([, value]) => value),
            ),
            {
                preserveState: true,
                replace: true,
                onFinish: () => setIsFiltering(false),
            },
        );
    };

    const resetFilters = () => {
        setQ('');
        setStatus('');
        setCategoryId('');
        setStock('');
        setIsFiltering(true);
        router.get(sellerProductsIndex().url, undefined, {
            onFinish: () => setIsFiltering(false),
        });
    };

    const deleteProduct = () => {
        if (!selected) {
            return;
        }

        router.delete(sellerProductsDestroy(selected.id), {
            preserveScroll: true,
            onStart: () => {
                setDeleting(true);
                setDeleteError(undefined);
            },
            onFinish: () => setDeleting(false),
            onSuccess: () => setSelected(null),
            onError: (errors) =>
                setDeleteError(
                    (errors as Record<string, string>).product ??
                        'Gagal menghapus produk.',
                ),
        });
    };

    const columns: { key: SortKey | 'actions'; label: string; sortable: boolean }[] =
        [
            { key: 'name', label: 'Nama', sortable: true },
            { key: 'category', label: 'Kategori', sortable: true },
            { key: 'price', label: 'Harga', sortable: true },
            { key: 'stock', label: 'Stok', sortable: true },
            { key: 'status', label: 'Status', sortable: true },
            { key: 'actions', label: 'Aksi', sortable: false },
        ];

    const isEmpty = !isFiltering && sortedData.length === 0;

    return (
        <>
            <Head title="Produk Seller" />
            <main className="min-h-[calc(100svh-4rem)] bg-slate-50 p-4 sm:p-6">
                <div className="space-y-6">
                    <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div>
                            <Badge className="mb-2 rounded-[6px] bg-blue-50 text-blue-700 border border-blue-100">
                                <Package className="size-3.5" aria-hidden="true" />
                                {products.total} produk
                            </Badge>
                            <h1 className="text-2xl font-semibold text-slate-950">
                                Produk Toko
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Kelola produk, harga, stok, dan status moderasi.
                            </p>
                        </div>
                        <Button
                            asChild
                            className="h-11 rounded-[12px] bg-[#0080FF] px-5 font-semibold text-white hover:bg-[#006FE0] active:bg-[#0059B8] transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                        >
                            <Link href={sellerProductsCreate()}>
                                <Plus className="size-4" aria-hidden="true" /> Tambah Produk
                            </Link>
                        </Button>
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

                    <Card className="gap-0 rounded-[14px] border-slate-100 py-0 shadow-sm transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-md motion-reduce:transition-none motion-reduce:hover:shadow-sm">
                        <CardHeader className="border-b border-slate-100 p-5">
                            <CardTitle>Filter Produk</CardTitle>
                            <CardDescription>
                                Cari nama produk atau batasi daftar.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5">
                            <form
                                onSubmit={submitFilters}
                                className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_12rem_12rem_10rem_auto]"
                            >
                                <label className="relative">
                                    <span className="sr-only">Cari produk</span>
                                    <Search
                                        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                                        aria-hidden="true"
                                    />
                                    <Input
                                        id="q"
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
                                    <span className="sr-only">Status</span>
                                    <Select
                                        value={status}
                                        onValueChange={setStatus}
                                    >
                                        <SelectTrigger
                                            aria-label="Filter status"
                                            className="h-11 w-full rounded-[10px] border-slate-200 bg-white shadow-none transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:border-[#0080FF] focus-visible:ring-2 focus-visible:ring-[#0080FF]/20"
                                        >
                                            <SelectValue placeholder="Pilih status" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-[14px] bg-white text-slate-900 ring-slate-200 shadow-lg">
                                            <SelectGroup>
                                                <SelectLabel>
                                                    Status
                                                </SelectLabel>
                                                <SelectItem value="all">
                                                    Semua status
                                                </SelectItem>
                                                <SelectItem value="draft">
                                                    Draft
                                                </SelectItem>
                                                <SelectItem value="pending">
                                                    Pending
                                                </SelectItem>
                                                <SelectItem value="approved">
                                                    Disetujui
                                                </SelectItem>
                                                <SelectItem value="rejected">
                                                    Ditolak
                                                </SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </label>
                                <label>
                                    <span className="sr-only">Kategori</span>
                                    <Select
                                        value={categoryId}
                                        onValueChange={setCategoryId}
                                    >
                                        <SelectTrigger
                                            aria-label="Filter kategori"
                                            className="h-11 w-full rounded-[10px] border-slate-200 bg-white shadow-none transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:border-[#0080FF] focus-visible:ring-2 focus-visible:ring-[#0080FF]/20"
                                        >
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-[14px] bg-white text-slate-900 ring-slate-200 shadow-lg">
                                            <SelectGroup>
                                                <SelectLabel>
                                                    Kategori
                                                </SelectLabel>
                                                <SelectItem value="all">
                                                    Semua kategori
                                                </SelectItem>
                                                {categories.map((category) => (
                                                    <SelectItem
                                                        key={category.id}
                                                        value={String(
                                                            category.id,
                                                        )}
                                                    >
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </label>
                                <label>
                                    <span className="sr-only">
                                        Kondisi stok
                                    </span>
                                    <Select
                                        value={stock}
                                        onValueChange={setStock}
                                    >
                                        <SelectTrigger
                                            aria-label="Filter kondisi stok"
                                            className="h-11 w-full rounded-[10px] border-slate-200 bg-white shadow-none transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:border-[#0080FF] focus-visible:ring-2 focus-visible:ring-[#0080FF]/20"
                                        >
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
                        </CardContent>
                    </Card>

                    <Card className="gap-0 overflow-hidden rounded-[14px] border-slate-100 py-0 shadow-sm transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-md motion-reduce:transition-none motion-reduce:hover:shadow-sm">
                        <CardHeader className="border-b border-slate-100 p-5">
                            <CardTitle>Katalog Produk</CardTitle>
                            <CardDescription>
                                {products.from ?? 0}-{products.to ?? 0} dari{' '}
                                {products.total} produk
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Desktop table */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                                            {columns.map((col) => (
                                                <TableHead
                                                    key={col.key}
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
                                                            onClick={() =>
                                                                handleSort(
                                                                    col.key as SortKey,
                                                                )
                                                            }
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
                                                            <Skeleton className="h-3 w-20 rounded-[6px] motion-reduce:animate-none" aria-hidden="true" />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <Skeleton className="h-4 w-24 rounded-[6px] motion-reduce:animate-none" aria-hidden="true" />
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <Skeleton className="h-4 w-20 rounded-[6px] motion-reduce:animate-none" aria-hidden="true" />
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <Skeleton className="h-5 w-16 rounded-full motion-reduce:animate-none" aria-hidden="true" />
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <Skeleton className="h-5 w-20 rounded-full motion-reduce:animate-none" aria-hidden="true" />
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <div className="flex justify-end gap-2">
                                                            <Skeleton className="h-9 w-16 rounded-[12px] motion-reduce:animate-none" aria-hidden="true" />
                                                            <Skeleton className="h-9 w-16 rounded-[12px] motion-reduce:animate-none" aria-hidden="true" />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : isEmpty ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={6}
                                                    className="p-0"
                                                >
                                                    <SellerEmptyState
                                                        icon={Package}
                                                        title="Tidak ada produk"
                                                        description="Belum ada produk yang sesuai filter. Tambah produk baru atau reset filter untuk melihat daftar lengkap."
                                                        actionHref={
                                                            sellerProductsCreate().url
                                                        }
                                                        actionLabel="Tambah Produk"
                                                        secondaryActionHref={
                                                            sellerProductsIndex().url
                                                        }
                                                        secondaryActionLabel="Reset"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            sortedData.map((product) => {
                                                const StatusIcon =
                                                    statusIcons[product.status.code];

                                                return (
                                                    <TableRow
                                                        key={product.id}
                                                        className="transition-colors duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                                                    >
                                                        <TableCell className="min-w-56 px-5 font-medium">
                                                            <div>
                                                                <p
                                                                    className="max-w-[20ch] truncate font-semibold text-slate-950"
                                                                    title={product.name}
                                                                >
                                                                    {product.name}
                                                                </p>
                                                                {product.is_pre_order && (
                                                                    <p className="mt-1 text-xs text-[#0080FF]">
                                                                        PO{' '}
                                                                        {
                                                                            product.pre_order_estimate_days
                                                                        }{' '}
                                                                        hari
                                                                    </p>
                                                                )}
                                                                {product.is_pre_order &&
                                                                    product.pre_order_deadline && (
                                                                        <p className="mt-1 text-xs text-slate-500">
                                                                            Deadline{' '}
                                                                            {
                                                                                product.pre_order_deadline
                                                                            }
                                                                        </p>
                                                                    )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-5 text-slate-600">
                                                            {product.category.name}
                                                        </TableCell>
                                                        <TableCell className="px-5 font-semibold tabular-nums text-slate-900">
                                                            {formatRupiah(
                                                                product.price,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="px-5">
                                                            {product.is_pre_order ? (
                                                                <Badge className="rounded-full border border-[#BCE0FF] bg-[#EFF8FF] text-[#0080FF] gap-1.5">
                                                                    <Clock3
                                                                        className="size-3"
                                                                        aria-hidden="true"
                                                                    />
                                                                    Pre-Order
                                                                </Badge>
                                                            ) : (
                                                                <span className="tabular-nums">
                                                                    {product.stock}
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="px-5">
                                                            <Badge
                                                                className={cn(
                                                                    'rounded-full gap-1.5 px-2.5 py-0.5 font-medium',
                                                                    statusStyles[
                                                                        product.status
                                                                            .code
                                                                    ],
                                                                )}
                                                            >
                                                                <StatusIcon
                                                                    className="size-3"
                                                                    aria-hidden="true"
                                                                />
                                                                {product.status.label}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="px-5">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    asChild
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-11 rounded-[12px] border-slate-200 bg-white px-3 font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                                                                    aria-label={`Edit ${product.name}`}
                                                                >
                                                                    <Link
                                                                        href={sellerProductsEdit(
                                                                            product.id,
                                                                        )}
                                                                    >
                                                                        <Pencil
                                                                            className="size-3.5"
                                                                            aria-hidden="true"
                                                                        />{' '}
                                                                        Edit
                                                                    </Link>
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setDeleteError(
                                                                            undefined,
                                                                        );
                                                                        setSelected(
                                                                            product,
                                                                        );
                                                                    }}
                                                                    className="h-11 rounded-[12px] border-[#FECACA] bg-white px-3 font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2"
                                                                    aria-label={`Hapus ${product.name}`}
                                                                >
                                                                    <Trash2
                                                                        className="size-3.5"
                                                                        aria-hidden="true"
                                                                    />{' '}
                                                                    Hapus
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
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
                                                    <Skeleton className="h-5 w-20 rounded-full motion-reduce:animate-none" />
                                                </div>
                                                <div className="flex gap-2 pt-1">
                                                    <Skeleton className="h-11 flex-1 rounded-[12px] motion-reduce:animate-none" />
                                                    <Skeleton className="h-11 flex-1 rounded-[12px] motion-reduce:animate-none" />
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                ) : isEmpty ? (
                                    <div className="rounded-[14px] border border-slate-100 bg-white shadow-sm">
                                        <SellerEmptyState
                                            icon={Package}
                                            title="Tidak ada produk"
                                            description="Belum ada produk yang sesuai filter. Tambah produk baru atau reset filter untuk melihat daftar lengkap."
                                            actionHref={sellerProductsCreate().url}
                                            actionLabel="Tambah Produk"
                                            secondaryActionHref={
                                                sellerProductsIndex().url
                                            }
                                            secondaryActionLabel="Reset"
                                        />
                                    </div>
                                ) : (
                                    sortedData.map((product) => {
                                        const StatusIcon =
                                            statusIcons[product.status.code];

                                        return (
                                            <Card
                                                key={`mobile-${product.id}`}
                                                className="rounded-[14px] border-slate-100 p-4 shadow-sm transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-md motion-reduce:transition-none"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <p
                                                            className="truncate text-sm font-semibold text-slate-950"
                                                            title={product.name}
                                                        >
                                                            {product.name}
                                                        </p>
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {product.category.name}
                                                        </p>
                                                        {product.is_pre_order && (
                                                            <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#0080FF]">
                                                                <Clock3
                                                                    className="size-3"
                                                                    aria-hidden="true"
                                                                />
                                                                PO{' '}
                                                                {
                                                                    product.pre_order_estimate_days
                                                                }{' '}
                                                                hari
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Badge
                                                        className={cn(
                                                            'shrink-0 rounded-full gap-1.5 font-medium',
                                                            statusStyles[
                                                                product.status.code
                                                            ],
                                                        )}
                                                    >
                                                        <StatusIcon
                                                            className="size-3"
                                                            aria-hidden="true"
                                                        />
                                                        {product.status.label}
                                                    </Badge>
                                                </div>

                                                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                                                    <span className="font-semibold tabular-nums text-slate-900">
                                                        {formatRupiah(product.price)}
                                                    </span>
                                                    <span className="text-slate-300" aria-hidden="true">
                                                        •
                                                    </span>
                                                    {product.is_pre_order ? (
                                                        <Badge className="rounded-full border border-[#BCE0FF] bg-[#EFF8FF] text-[#0080FF] gap-1">
                                                            <Clock3
                                                                className="size-3"
                                                                aria-hidden="true"
                                                            />
                                                            Pre-Order
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-sm tabular-nums text-slate-600">
                                                            Stok {product.stock}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-4 flex gap-2">
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        className="h-11 flex-1 rounded-[12px] border-slate-200 bg-white font-semibold transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                                                    >
                                                        <Link
                                                            href={sellerProductsEdit(
                                                                product.id,
                                                            )}
                                                            aria-label={`Edit ${product.name}`}
                                                        >
                                                            <Pencil
                                                                className="size-3.5"
                                                                aria-hidden="true"
                                                            />
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setDeleteError(undefined);
                                                            setSelected(product);
                                                        }}
                                                        className="h-11 flex-1 rounded-[12px] border-[#FECACA] bg-white font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2"
                                                        aria-label={`Hapus ${product.name}`}
                                                    >
                                                        <Trash2
                                                            className="size-3.5"
                                                            aria-hidden="true"
                                                        />
                                                        Hapus
                                                    </Button>
                                                </div>
                                            </Card>
                                        );
                                    })
                                )}
                            </div>

                            {products.last_page > 1 && (
                                <div className="flex items-center justify-between border-t border-slate-100 p-4">
                                    <span className="text-sm text-slate-500">
                                        Halaman {products.current_page} dari{' '}
                                        {products.last_page}
                                    </span>
                                    <div className="flex flex-wrap justify-end gap-2">
                                        {products.links.map((link, index) => {
                                            const label =
                                                index === 0
                                                    ? 'Sebelumnya'
                                                    : index ===
                                                        products.links.length -
                                                            1
                                                      ? 'Berikutnya'
                                                      : link.label;

                                            return (
                                                <Button
                                                    key={`${link.label}-${index}`}
                                                    asChild={Boolean(link.url)}
                                                    disabled={!link.url}
                                                    variant={
                                                        link.active
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                    className={cn(
                                                        'h-11 rounded-[12px] px-4 font-semibold transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2',
                                                        link.active
                                                            ? 'bg-[#0080FF] text-white hover:bg-[#006FE0]'
                                                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                                                    )}
                                                    aria-current={
                                                        link.active
                                                            ? 'page'
                                                            : undefined
                                                    }
                                                >
                                                    {link.url ? (
                                                        <Link href={link.url}>
                                                            {label}
                                                        </Link>
                                                    ) : (
                                                        <span>{label}</span>
                                                    )}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Dialog
                open={Boolean(selected)}
                onOpenChange={(open) => !open && !deleting && setSelected(null)}
            >
                <DialogContent
                    className="rounded-[18px] border-slate-200 bg-white shadow-lg duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                    showCloseButton={!deleting}
                >
                    <DialogHeader>
                        <DialogTitle>Hapus produk?</DialogTitle>
                        <DialogDescription>
                            {selected?.name} akan dihapus permanen. Produk
                            dengan riwayat pesanan tidak dapat dihapus.
                        </DialogDescription>
                        {deleteError && (
                            <p
                                role="alert"
                                className="rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-sm text-[#DC2626]"
                            >
                                {deleteError}
                            </p>
                        )}
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                disabled={deleting}
                                className="h-11 rounded-[12px] border-slate-200 bg-white font-semibold transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                            >
                                Batal
                            </Button>
                        </DialogClose>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={deleting}
                            onClick={deleteProduct}
                            className="h-11 rounded-[12px] font-semibold transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2"
                            aria-busy={deleting}
                        >
                            {deleting && (
                                <Spinner className="size-4" aria-hidden="true" />
                            )}
                            {deleting ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

SellerProductsIndex.layout = {
    breadcrumbs: [{ title: 'Produk Seller', href: sellerProductsIndex() }],
};
