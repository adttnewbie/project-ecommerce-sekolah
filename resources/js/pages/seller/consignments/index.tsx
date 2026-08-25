import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDown, Package, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
import { index as sellerConsignmentsIndex } from '@/routes/seller/consignments';
import { create as sellerProductsCreate } from '@/routes/seller/products';

type ConsignmentStatus =
    | 'pending_approval'
    | 'approved'
    | 'received'
    | 'completed'
    | 'rejected'
    | 'cancelled';

type Props = {
    consignments: {
        id: number;
        product_name: string;
        up_jurusan_name: string;
        requested_quantity: number;
        received_quantity: number;
        sold_quantity: number;
        commission_rate: number;
        seller_earnings: number;
        paid_amount: number;
        unpaid_amount: number;
        status: { code: ConsignmentStatus; label: string };
    }[];
};

const statusStyles: Record<ConsignmentStatus, string> = {
    pending_approval: 'bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]',
    approved: 'bg-[#EFF8FF] text-[#0080FF] border border-[#BCE0FF]',
    received: 'bg-cyan-50 text-cyan-700 border border-cyan-100',
    completed: 'bg-[#ECFDF3] text-[#16A34A] border border-[#BBF7D0]',
    rejected: 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]',
    cancelled: 'bg-slate-100 text-slate-700 border border-slate-200',
};

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

type SortKey = 'product' | 'up_jurusan' | 'unpaid_amount' | 'status';
type SortOrder = 'asc' | 'desc';

export default function SellerConsignments({ consignments }: Props) {
    const [q, setQ] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isFiltering, setIsFiltering] = useState(false);
    const [sortKey, setSortKey] = useState<SortKey | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 10;

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const submitFilters = (event: React.FormEvent) => {
        event.preventDefault();
        setIsFiltering(true);
        router.get(
            sellerConsignmentsIndex(),
            Object.fromEntries(
                Object.entries({
                    q: q || undefined,
                    status: statusFilter === 'all' ? undefined : statusFilter,
                }).filter(([, v]) => v !== undefined && v !== ''),
            ),
            {
                preserveState: true,
                replace: true,
                onFinish: () => setIsFiltering(false),
            },
        );
        setCurrentPage(1);
        // simulate brief loading for client filter feedback
        setTimeout(() => setIsFiltering(false), 180);
    };

    const resetFilters = () => {
        setQ('');
        setStatusFilter('all');
        setIsFiltering(true);
        router.get(sellerConsignmentsIndex().url, undefined, {
            preserveState: true,
            replace: true,
            onFinish: () => setIsFiltering(false),
        });
        setCurrentPage(1);
        setTimeout(() => setIsFiltering(false), 180);
    };

    const filteredAndSorted = useMemo(() => {
        let data = [...consignments];

        if (q.trim()) {
            const needle = q.trim().toLowerCase();
            data = data.filter(
                (item) =>
                    item.product_name.toLowerCase().includes(needle) ||
                    item.up_jurusan_name.toLowerCase().includes(needle),
            );
        }

        if (statusFilter !== 'all') {
            data = data.filter((item) => item.status.code === statusFilter);
        }

        if (sortKey) {
            data.sort((a, b) => {
                let aVal: string | number = '';
                let bVal: string | number = '';

                switch (sortKey) {
                    case 'product':
                        aVal = a.product_name.toLowerCase();
                        bVal = b.product_name.toLowerCase();
                        break;
                    case 'up_jurusan':
                        aVal = a.up_jurusan_name.toLowerCase();
                        bVal = b.up_jurusan_name.toLowerCase();
                        break;
                    case 'unpaid_amount':
                        aVal = a.unpaid_amount;
                        bVal = b.unpaid_amount;
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
        }

        return data;
    }, [consignments, q, statusFilter, sortKey, sortOrder]);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / perPage));

        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [filteredAndSorted.length, currentPage]);

    const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / perPage));
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * perPage;

        return filteredAndSorted.slice(start, start + perPage);
    }, [filteredAndSorted, currentPage]);

    const isEmpty = !isFiltering && filteredAndSorted.length === 0;
    const showPagination = totalPages > 1;

    return (
        <>
            <Head title="Titip Barang" />
            <main className="min-h-[calc(100svh-4rem)] bg-slate-50 p-4 sm:p-6">
                <div className="space-y-6">
                    <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div>
                            <Badge className="mb-2 rounded-[6px] border border-[#BCE0FF] bg-[#EFF8FF] text-[#0080FF]">
                                <Package className="size-3.5" aria-hidden="true" />
                                {consignments.length} titipan
                            </Badge>
                            <h1 className="text-2xl font-semibold text-slate-950">
                                Titip Barang UP Jurusan
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Pantau status produk yang dijual lewat UP
                                Jurusan.
                            </p>
                        </div>
                        <Button
                            asChild
                            className="h-11 rounded-[12px] bg-[#0080FF] px-5 font-semibold text-white hover:bg-[#006FE0] active:bg-[#0059B8] transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                        >
                            <Link href={sellerProductsCreate()}>
                                <Plus className="size-4" aria-hidden="true" /> Tambah Produk
                                Titipan
                            </Link>
                        </Button>
                    </section>

                    <Card className="gap-0 overflow-hidden rounded-[14px] border-slate-100 py-0 shadow-sm transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-md motion-reduce:transition-none motion-reduce:hover:shadow-sm">
                        <CardHeader className="border-b border-slate-100 p-5 space-y-4">
                            <div>
                                <CardTitle>Daftar Titipan</CardTitle>
                                <CardDescription>
                                    {filteredAndSorted.length === 0
                                        ? 'Belum ada produk titipan'
                                        : `${filteredAndSorted.length} produk titipan • Pantau stok diterima, terjual, dan saldo`}
                                </CardDescription>
                            </div>
                            <form
                                onSubmit={submitFilters}
                                className="grid gap-3 md:grid-cols-[1fr_12rem_auto]"
                            >
                                <label className="relative">
                                    <span className="sr-only">Cari titipan</span>
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                                    <Input
                                        value={q}
                                        onChange={(event) => setQ(event.target.value)}
                                        placeholder="Cari produk atau UP Jurusan"
                                        aria-describedby="consignment-q-error"
                                        className="h-11 rounded-[10px] border-slate-200 bg-white pl-9 shadow-none transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:border-[#0080FF] focus-visible:ring-2 focus-visible:ring-[#0080FF]/20"
                                    />
                                    <span id="consignment-q-error" className="sr-only" aria-live="polite" />
                                </label>
                                <label>
                                    <span className="sr-only">Status</span>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger aria-label="Filter status titipan" className="h-11 w-full rounded-[10px] border-slate-200 bg-white shadow-none transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:border-[#0080FF] focus-visible:ring-2 focus-visible:ring-[#0080FF]/20">
                                            <SelectValue placeholder="Pilih status" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-[14px] bg-white text-slate-900 ring-slate-200 shadow-lg">
                                            <SelectGroup>
                                                <SelectLabel>Status</SelectLabel>
                                                <SelectItem value="all">Semua status</SelectItem>
                                                <SelectItem value="pending_approval">Menunggu persetujuan</SelectItem>
                                                <SelectItem value="approved">Disetujui</SelectItem>
                                                <SelectItem value="received">Diterima</SelectItem>
                                                <SelectItem value="completed">Selesai</SelectItem>
                                                <SelectItem value="rejected">Ditolak</SelectItem>
                                                <SelectItem value="cancelled">Dibatalkan</SelectItem>
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
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Desktop table */}
                            <div className="hidden overflow-x-auto md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                                            <TableHead className="px-5" aria-sort={sortKey === 'product' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : undefined}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSort('product')}
                                                    className="inline-flex items-center gap-1.5 font-semibold text-slate-500 hover:text-slate-900 transition-colors duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2 rounded-[6px] px-1 -mx-1"
                                                    aria-label={`Urutkan Produk ${sortKey === 'product' ? (sortOrder === 'asc' ? 'menaik' : 'menurun') : ''}`}
                                                >
                                                    Produk
                                                    <ArrowUpDown className={cn('size-3.5 shrink-0 transition-colors duration-[180ms]', sortKey === 'product' ? 'text-[#0080FF]' : 'text-slate-400')} aria-hidden="true" />
                                                </button>
                                            </TableHead>
                                            <TableHead className="px-5" aria-sort={sortKey === 'up_jurusan' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : undefined}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSort('up_jurusan')}
                                                    className="inline-flex items-center gap-1.5 font-semibold text-slate-500 hover:text-slate-900 transition-colors duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2 rounded-[6px] px-1 -mx-1"
                                                    aria-label={`Urutkan UP Jurusan ${sortKey === 'up_jurusan' ? (sortOrder === 'asc' ? 'menaik' : 'menurun') : ''}`}
                                                >
                                                    UP Jurusan
                                                    <ArrowUpDown className={cn('size-3.5 shrink-0 transition-colors duration-[180ms]', sortKey === 'up_jurusan' ? 'text-[#0080FF]' : 'text-slate-400')} aria-hidden="true" />
                                                </button>
                                            </TableHead>
                                            <TableHead className="px-5">Request</TableHead>
                                            <TableHead className="px-5">Diterima</TableHead>
                                            <TableHead className="px-5">Terjual</TableHead>
                                            <TableHead className="px-5">Komisi</TableHead>
                                            <TableHead className="px-5" aria-sort={sortKey === 'unpaid_amount' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : undefined}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSort('unpaid_amount')}
                                                    className="inline-flex items-center gap-1.5 font-semibold text-slate-500 hover:text-slate-900 transition-colors duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2 rounded-[6px] px-1 -mx-1"
                                                    aria-label={`Urutkan Saldo Belum Dibayar ${sortKey === 'unpaid_amount' ? (sortOrder === 'asc' ? 'menaik' : 'menurun') : ''}`}
                                                >
                                                    Saldo Belum Dibayar
                                                    <ArrowUpDown className={cn('size-3.5 shrink-0 transition-colors duration-[180ms]', sortKey === 'unpaid_amount' ? 'text-[#0080FF]' : 'text-slate-400')} aria-hidden="true" />
                                                </button>
                                            </TableHead>
                                            <TableHead className="px-5" aria-sort={sortKey === 'status' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : undefined}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSort('status')}
                                                    className="inline-flex items-center gap-1.5 font-semibold text-slate-500 hover:text-slate-900 transition-colors duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2 rounded-[6px] px-1 -mx-1"
                                                    aria-label={`Urutkan Status ${sortKey === 'status' ? (sortOrder === 'asc' ? 'menaik' : 'menurun') : ''}`}
                                                >
                                                    Status
                                                    <ArrowUpDown className={cn('size-3.5 shrink-0 transition-colors duration-[180ms]', sortKey === 'status' ? 'text-[#0080FF]' : 'text-slate-400')} aria-hidden="true" />
                                                </button>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isFiltering ? (
                                            Array.from({ length: 5 }).map((_, idx) => (
                                                <TableRow key={`skeleton-${idx}`}>
                                                    <TableCell className="px-5">
                                                        <Skeleton className="h-4 w-32 rounded-[6px] motion-reduce:animate-none" aria-hidden="true" />
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <Skeleton className="h-4 w-28 rounded-[6px] motion-reduce:animate-none" aria-hidden="true" />
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <Skeleton className="h-4 w-12 rounded-[6px] motion-reduce:animate-none" aria-hidden="true" />
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <Skeleton className="h-4 w-12 rounded-[6px] motion-reduce:animate-none" aria-hidden="true" />
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <Skeleton className="h-4 w-12 rounded-[6px] motion-reduce:animate-none" aria-hidden="true" />
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <Skeleton className="h-4 w-10 rounded-[6px] motion-reduce:animate-none" aria-hidden="true" />
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <Skeleton className="h-4 w-24 rounded-[6px] motion-reduce:animate-none" aria-hidden="true" />
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <Skeleton className="h-5 w-20 rounded-full motion-reduce:animate-none" aria-hidden="true" />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : isEmpty ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="p-0">
                                                    <SellerEmptyState
                                                        icon={Package}
                                                        title="Belum ada titipan"
                                                        description="Belum ada produk titipan. Tambah produk titipan untuk mulai menjual lewat UP Jurusan."
                                                        actionHref={sellerProductsCreate().url}
                                                        actionLabel="Tambah Produk Titipan"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedData.map((item) => (
                                                <TableRow key={item.id} className="transition-colors duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none">
                                                    <TableCell className="min-w-56 px-5 font-medium text-slate-950">
                                                        <p className="max-w-[20ch] truncate font-semibold" title={item.product_name}>
                                                            {item.product_name}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="px-5 text-slate-600">
                                                        {item.up_jurusan_name}
                                                    </TableCell>
                                                    <TableCell className="px-5 tabular-nums">
                                                        {item.requested_quantity}
                                                    </TableCell>
                                                    <TableCell className="px-5 tabular-nums">
                                                        {item.received_quantity}
                                                    </TableCell>
                                                    <TableCell className="px-5 tabular-nums">
                                                        {item.sold_quantity}
                                                    </TableCell>
                                                    <TableCell className="px-5 tabular-nums">
                                                        {item.commission_rate}%
                                                    </TableCell>
                                                    <TableCell className="px-5 font-medium tabular-nums">
                                                        {formatRupiah(
                                                            item.unpaid_amount,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <Badge
                                                            className={cn(
                                                                'rounded-full px-2.5 py-0.5 font-medium',
                                                                statusStyles[
                                                                    item.status.code
                                                                ] ?? 'bg-slate-100 text-slate-700 border border-slate-200',
                                                            )}
                                                        >
                                                            {item.status.label}
                                                        </Badge>
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
                                        <Card key={`mobile-skeleton-${idx}`} className="rounded-[14px] border-slate-100 p-4 shadow-sm" aria-hidden="true">
                                            <div className="space-y-3">
                                                <Skeleton className="h-4 w-3/4 rounded-[6px] motion-reduce:animate-none" />
                                                <Skeleton className="h-3 w-1/2 rounded-[6px] motion-reduce:animate-none" />
                                                <div className="flex gap-2">
                                                    <Skeleton className="h-5 w-16 rounded-full motion-reduce:animate-none" />
                                                    <Skeleton className="h-5 w-20 rounded-full motion-reduce:animate-none" />
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <Skeleton className="h-12 rounded-[10px] motion-reduce:animate-none" />
                                                    <Skeleton className="h-12 rounded-[10px] motion-reduce:animate-none" />
                                                    <Skeleton className="h-12 rounded-[10px] motion-reduce:animate-none" />
                                                </div>
                                                <Skeleton className="h-4 w-32 rounded-[6px] motion-reduce:animate-none" />
                                            </div>
                                        </Card>
                                    ))
                                ) : isEmpty ? (
                                    <div className="rounded-[14px] border border-slate-100 bg-white shadow-sm">
                                        <SellerEmptyState
                                            icon={Package}
                                            title="Belum ada titipan"
                                            description="Belum ada produk titipan. Tambah produk titipan untuk mulai menjual lewat UP Jurusan."
                                            actionHref={sellerProductsCreate().url}
                                            actionLabel="Tambah Produk Titipan"
                                        />
                                    </div>
                                ) : (
                                    paginatedData.map((item) => (
                                        <Card
                                            key={`mobile-${item.id}`}
                                            className="rounded-[14px] border-slate-100 p-4 shadow-sm transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-md motion-reduce:transition-none"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-slate-950" title={item.product_name}>
                                                        {item.product_name}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">{item.up_jurusan_name}</p>
                                                </div>
                                                <Badge className={cn('shrink-0 rounded-full font-medium', statusStyles[item.status.code] ?? 'bg-slate-100 text-slate-700 border border-slate-200')}>
                                                    {item.status.label}
                                                </Badge>
                                            </div>
                                            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                                                <div className="rounded-[10px] border border-slate-100 bg-slate-50 px-2 py-2">
                                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Request</p>
                                                    <p className="mt-1 text-sm font-semibold tabular-nums text-slate-900">{item.requested_quantity}</p>
                                                </div>
                                                <div className="rounded-[10px] border border-slate-100 bg-slate-50 px-2 py-2">
                                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Diterima</p>
                                                    <p className="mt-1 text-sm font-semibold tabular-nums text-slate-900">{item.received_quantity}</p>
                                                </div>
                                                <div className="rounded-[10px] border border-slate-100 bg-slate-50 px-2 py-2">
                                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Terjual</p>
                                                    <p className="mt-1 text-sm font-semibold tabular-nums text-slate-900">{item.sold_quantity}</p>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between gap-2">
                                                <div>
                                                    <p className="text-xs text-slate-500">Saldo belum dibayar</p>
                                                    <p className="text-sm font-semibold tabular-nums text-slate-900">{formatRupiah(item.unpaid_amount)}</p>
                                                    <p className="text-xs tabular-nums text-slate-500">{item.commission_rate}% komisi</p>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>

                            {showPagination ? (
                                <div className="flex items-center justify-between border-t border-slate-100 p-4">
                                    <span className="text-sm text-slate-500">
                                        Halaman {currentPage} dari {totalPages} • {filteredAndSorted.length} titipan
                                    </span>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={currentPage <= 1}
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            className="h-11 rounded-[12px] border-slate-200 bg-white px-4 font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2 disabled:opacity-50"
                                        >
                                            Sebelumnya
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={currentPage >= totalPages}
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            className="h-11 rounded-[12px] border-slate-200 bg-white px-4 font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2 disabled:opacity-50"
                                        >
                                            Berikutnya
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                !isEmpty && !isFiltering ? (
                                    <div className="flex items-center justify-between border-t border-slate-100 p-4">
                                        <span className="text-sm text-slate-500">
                                            {filteredAndSorted.length} titipan
                                        </span>
                                        <span className="text-xs text-slate-400">Halaman 1 dari 1</span>
                                    </div>
                                ) : null
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    );
}

SellerConsignments.layout = {
    breadcrumbs: [{ title: 'Titip Barang', href: sellerConsignmentsIndex() }],
};
