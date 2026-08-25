import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowUpDown,
    CheckCircle2,
    Eye,
    Search,
    ShoppingCart,
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
    index as ordersIndex,
    show as ordersShow,
    updateStatus,
} from '@/routes/seller/orders';

type OrderStatus =
    | 'pending'
    | 'in_production'
    | 'ready'
    | 'packed'
    | 'sent'
    | 'completed'
    | 'cancelled';

type PaymentStatus = 'unpaid' | 'pending_confirmation' | 'paid' | 'rejected';

type SellerOrderItem = {
    id: number;
    source: 'online' | 'offline';
    code?: string;
    detail_url?: string;
    order_id: number | string;
    buyer: { id: number | null; name: string };
    product: { id: number; name: string; slug: string };
    managed_by_up_jurusan: boolean;
    is_pre_order: boolean;
    pre_order_estimate_days: number | null;
    pre_order_deadline: string | null;
    pre_order_min_quantity: number | null;
    pre_order_note: string | null;
    product_name: string;
    price: number;
    quantity: number;
    subtotal: number;
    status: { code: OrderStatus; label: string };
    payment: {
        status: { code: PaymentStatus; label: string };
        method: { code: string; label: string };
        confirmed_at: string | null;
        rejection_reason: string | null;
    };
    created_at: string;
    cancelled_at: string | null;
};

type SellerOrdersProps = {
    orderItems: {
        data: SellerOrderItem[];
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: { q: string; status: string };
};

const statusStyles: Record<OrderStatus, string> = {
    pending: 'bg-[#EFF8FF] text-[#0080FF] border border-[#BCE0FF]',
    in_production: 'bg-violet-50 text-violet-700 border border-violet-100',
    ready: 'bg-cyan-50 text-cyan-700 border border-cyan-100',
    packed: 'bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]',
    sent: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    completed: 'bg-[#ECFDF3] text-[#16A34A] border border-[#BBF7D0]',
    cancelled: 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]',
};

const paymentStatusStyles: Record<PaymentStatus, string> = {
    unpaid: 'bg-slate-100 text-slate-700 border border-slate-200',
    pending_confirmation: 'bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]',
    paid: 'bg-[#ECFDF3] text-[#16A34A] border border-[#BBF7D0]',
    rejected: 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]',
};

const nextStatus: Record<
    Exclude<OrderStatus, 'sent' | 'completed' | 'cancelled'>,
    { code: OrderStatus; action: string }
> = {
    pending: { code: 'packed', action: 'Tandai dikemas' },
    in_production: { code: 'ready', action: 'Tandai siap' },
    ready: { code: 'sent', action: 'Tandai dikirim' },
    packed: { code: 'sent', action: 'Tandai dikirim' },
};

const nextActionFor = (item: SellerOrderItem) => {
    if (
        item.status.code === 'sent' ||
        item.status.code === 'completed' ||
        item.status.code === 'cancelled'
    ) {
        return null;
    }

    if (item.is_pre_order && item.status.code === 'pending') {
        return { code: 'in_production' as const, action: 'Mulai produksi' };
    }

    return nextStatus[item.status.code as Exclude<OrderStatus, 'sent' | 'completed' | 'cancelled'>] ?? null;
};

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

const formatDate = (value: string) =>
    new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));

type SortKey = 'amount' | 'time' | 'status';
type SortOrder = 'asc' | 'desc';

export default function SellerOrdersIndex({
    orderItems,
    filters,
}: SellerOrdersProps) {
    const { flash } = usePage().props as {
        flash: { success?: string; error?: string };
    };
    const [q, setQ] = useState(filters.q);
    const [status, setStatus] = useState(filters.status || '');
    const [processingId, setProcessingId] = useState<number>();
    const [paymentProcessingId, setPaymentProcessingId] = useState<number>();
    const [statusError, setStatusError] = useState<string>();
    const [paymentError, setPaymentError] = useState<string>();
    const [isFiltering, setIsFiltering] = useState(false);
    const [sortKey, setSortKey] = useState<SortKey | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

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
return orderItems.data;
}

        const copy = [...orderItems.data];
        copy.sort((a, b) => {
            let aVal: string | number = '';
            let bVal: string | number = '';

            switch (sortKey) {
                case 'amount':
                    aVal = a.subtotal;
                    bVal = b.subtotal;
                    break;
                case 'time':
                    aVal = new Date(a.created_at).getTime();
                    bVal = new Date(b.created_at).getTime();
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
    }, [orderItems.data, sortKey, sortOrder]);

    const isEmpty = !isFiltering && sortedData.length === 0;

    const submitFilters = (event: React.FormEvent) => {
        event.preventDefault();
        setIsFiltering(true);
        router.get(
            ordersIndex(),
            Object.fromEntries(
                Object.entries({
                    q,
                    status: status === 'all' ? '' : status,
                }).filter(([, value]) => value),
            ),
            { preserveState: true, replace: true, onFinish: () => setIsFiltering(false) },
        );
    };

    const resetFilters = () => {
        setQ('');
        setStatus('');
        setIsFiltering(true);
        router.get(ordersIndex().url, undefined, {
            preserveState: true,
            replace: true,
            onFinish: () => setIsFiltering(false),
        });
    };

    const advanceStatus = (item: SellerOrderItem) => {
        if (
            item.source === 'offline' ||
            item.status.code === 'sent' ||
            item.status.code === 'completed'
        ) {
            return;
        }

        const action = nextActionFor(item);

        if (!action) {
            return;
        }

        setStatusError(undefined);

        router.put(
            updateStatus(item.id),
            { status: action.code },
            {
                preserveScroll: true,
                onStart: () => setProcessingId(item.id),
                onFinish: () => setProcessingId(undefined),
                onError: (errors) => setStatusError((errors as Record<string, string>).status),
            },
        );
    };

    const approvePayment = (item: SellerOrderItem) => {
        if (
            item.source !== 'online' ||
            item.managed_by_up_jurusan ||
            item.payment.status.code === 'paid'
        ) {
            return;
        }

        setPaymentError(undefined);

        router.post(
            `/seller/orders/${item.id}/payment/approve`,
            {},
            {
                preserveScroll: true,
                onStart: () => setPaymentProcessingId(item.id),
                onFinish: () => setPaymentProcessingId(undefined),
                onError: (errors) => setPaymentError((errors as Record<string, string>).payment),
            },
        );
    };

    const tableColumns: { key: string; label: string; sortable: boolean; sortKey?: SortKey }[] = [
        { key: 'order', label: 'Order', sortable: false },
        { key: 'buyer', label: 'Pembeli', sortable: false },
        { key: 'product', label: 'Produk', sortable: false },
        { key: 'quantity', label: 'Jumlah', sortable: false },
        { key: 'amount', label: 'Subtotal', sortable: true, sortKey: 'amount' },
        { key: 'payment', label: 'Pembayaran', sortable: false },
        { key: 'status', label: 'Status', sortable: true, sortKey: 'status' },
        { key: 'time', label: 'Waktu', sortable: true, sortKey: 'time' },
        { key: 'actions', label: 'Aksi', sortable: false },
    ];

    return (
        <>
            <Head title="Pesanan Seller" />
            <main className="min-h-[calc(100svh-4rem)] bg-slate-50 p-4 sm:p-6">
                <div className="space-y-6">
                    <section>
                        <Badge className="mb-2 rounded-[6px] border border-[#BCE0FF] bg-[#EFF8FF] text-[#0080FF]">
                            <ShoppingCart className="size-3.5" aria-hidden="true" />{' '}
                            {orderItems.total} item pesanan
                        </Badge>
                        <h1 className="text-2xl font-semibold text-slate-950">
                            Pesanan
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Proses pemenuhan produk yang dibeli dari toko Anda.
                        </p>
                    </section>

                    {(flash.success ||
                        flash.error ||
                        statusError ||
                        paymentError) && (
                        <div
                            role="status"
                            className={cn(
                                'rounded-[14px] border px-4 py-3 text-sm shadow-sm transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
                                flash.error || statusError || paymentError
                                    ? 'border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]'
                                    : 'border-[#BBF7D0] bg-[#ECFDF3] text-[#16A34A]',
                            )}
                        >
                            {statusError ||
                                paymentError ||
                                flash.error ||
                                flash.success}
                        </div>
                    )}

                    <Card className="gap-0 rounded-[14px] border-slate-100 py-0 shadow-sm transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-md motion-reduce:transition-none motion-reduce:hover:shadow-sm">
                        <CardHeader className="border-b border-slate-100 p-5">
                            <CardTitle>Daftar Pesanan</CardTitle>
                            <CardDescription>
                                {orderItems.from ?? 0}-{orderItems.to ?? 0} dari{' '}
                                {orderItems.total} item
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <form
                                onSubmit={submitFilters}
                                className="grid gap-3 border-b border-slate-100 p-5 sm:grid-cols-[1fr_12rem_auto]"
                            >
                                <label className="relative">
                                    <span className="sr-only">
                                        Cari pesanan
                                    </span>
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                                    <Input
                                        id="q"
                                        value={q}
                                        onChange={(event) =>
                                            setQ(event.target.value)
                                        }
                                        placeholder="Nomor order, pembeli, atau produk"
                                        aria-describedby="q-filter-error"
                                        className="h-11 rounded-[10px] border-slate-200 bg-white pl-9 shadow-none transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:border-[#0080FF] focus-visible:ring-2 focus-visible:ring-[#0080FF]/20"
                                    />
                                    <span id="q-filter-error" className="sr-only" aria-live="polite" />
                                </label>
                                <label>
                                    <span className="sr-only">
                                        Status pesanan
                                    </span>
                                    <Select
                                        value={status}
                                        onValueChange={setStatus}
                                    >
                                        <SelectTrigger aria-label="Filter status pesanan" className="h-11 w-full rounded-[10px] border-slate-200 bg-white shadow-none transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:border-[#0080FF] focus-visible:ring-2 focus-visible:ring-[#0080FF]/20">
                                            <SelectValue placeholder="Pilih status pesanan" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-[14px] bg-white text-slate-900 ring-slate-200 shadow-lg">
                                            <SelectGroup>
                                                <SelectLabel>
                                                    Status pesanan
                                                </SelectLabel>
                                                <SelectItem value="all">
                                                    Semua status
                                                </SelectItem>
                                                <SelectItem value="pending">
                                                    Menunggu
                                                </SelectItem>
                                                <SelectItem value="in_production">
                                                    Diproduksi
                                                </SelectItem>
                                                <SelectItem value="ready">
                                                    Siap
                                                </SelectItem>
                                                <SelectItem value="packed">
                                                    Dikemas
                                                </SelectItem>
                                                <SelectItem value="sent">
                                                    Dikirim
                                                </SelectItem>
                                                <SelectItem value="completed">
                                                    Selesai
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
                                        className="h-11 rounded-[12px] border-slate-200 bg-white px-5 font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                                        onClick={resetFilters}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </form>

                            {/* Desktop table */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader className="sticky top-0 z-10 bg-slate-50">
                                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                                            {tableColumns.map((col) => (
                                                <TableHead
                                                    key={col.key}
                                                    className="px-5"
                                                    aria-sort={
                                                        col.sortKey && sortKey === col.sortKey
                                                            ? sortOrder === 'asc'
                                                                ? 'ascending'
                                                                : 'descending'
                                                            : undefined
                                                    }
                                                >
                                                    {col.sortable && col.sortKey ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSort(col.sortKey as SortKey)}
                                                            className="inline-flex items-center gap-1.5 font-semibold text-slate-500 hover:text-slate-900 transition-colors duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2 rounded-[6px] px-1 -mx-1"
                                                            aria-label={`Urutkan ${col.label} ${sortKey === col.sortKey ? (sortOrder === 'asc' ? 'menaik' : 'menurun') : ''}`}
                                                        >
                                                            {col.label}
                                                            <ArrowUpDown
                                                                className={cn(
                                                                    'size-3.5 shrink-0 transition-colors duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
                                                                    sortKey === col.sortKey
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
                                                            <Skeleton className="h-4 w-28 rounded-[6px] motion-reduce:animate-none" aria-hidden="true" />
                                                            <Skeleton className="h-3 w-16 rounded-[6px] motion-reduce:animate-none" aria-hidden="true" />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <Skeleton className="h-4 w-24 rounded-[6px] motion-reduce:animate-none" aria-hidden="true" />
                                                    </TableCell>
                                                    <TableCell className="min-w-52 px-5">
                                                        <div className="space-y-2 py-1">
                                                            <Skeleton className="h-4 w-36 rounded-[6px] motion-reduce:animate-none" aria-hidden="true" />
                                                            <Skeleton className="h-3 w-20 rounded-[6px] motion-reduce:animate-none" aria-hidden="true" />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <Skeleton className="h-4 w-8 rounded-[6px] motion-reduce:animate-none" aria-hidden="true" />
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <Skeleton className="h-4 w-20 rounded-[6px] motion-reduce:animate-none" aria-hidden="true" />
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <div className="space-y-1">
                                                            <Skeleton className="h-5 w-20 rounded-[6px] motion-reduce:animate-none" aria-hidden="true" />
                                                            <Skeleton className="h-3 w-16 rounded-[6px] motion-reduce:animate-none" aria-hidden="true" />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <Skeleton className="h-5 w-20 rounded-full motion-reduce:animate-none" aria-hidden="true" />
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <Skeleton className="h-4 w-28 rounded-[6px] motion-reduce:animate-none" aria-hidden="true" />
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <div className="flex justify-end gap-2">
                                                            <Skeleton className="h-11 w-[72px] rounded-[12px] motion-reduce:animate-none" aria-hidden="true" />
                                                            <Skeleton className="h-11 w-[110px] rounded-[12px] motion-reduce:animate-none" aria-hidden="true" />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : isEmpty ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="p-0">
                                                    <SellerEmptyState
                                                        icon={ShoppingCart}
                                                        title="Tidak ada pesanan"
                                                        description="Belum ada pesanan yang sesuai filter. Coba ubah kata kunci atau reset filter untuk melihat semua pesanan."
                                                        actionHref={ordersIndex().url}
                                                        actionLabel="Reset"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            sortedData.map((item) => (
                                                <TableRow key={item.id} className="transition-colors duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none">
                                                    <TableCell className="px-5 font-semibold">
                                                        {item.code ??
                                                            `#${item.order_id}`}
                                                        {item.source ===
                                                            'offline' && (
                                                            <Badge className="mt-1 block w-fit rounded-[6px] border border-[#BBF7D0] bg-[#ECFDF3] text-[#16A34A]">
                                                                Offline/POS
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        {item.buyer.name}
                                                    </TableCell>
                                                    <TableCell className="min-w-52 px-5">
                                                        <div>
                                                            <p className="font-medium text-slate-950">
                                                                {item.product_name}
                                                            </p>
                                                            {item.is_pre_order && (
                                                                <p className="mt-1 text-xs text-[#0080FF]">
                                                                    PO{' '}
                                                                    {
                                                                        item.pre_order_estimate_days
                                                                    }{' '}
                                                                    hari
                                                                    {item.pre_order_deadline &&
                                                                        ` • Deadline ${item.pre_order_deadline}`}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-5 tabular-nums">
                                                        {item.quantity}
                                                    </TableCell>
                                                    <TableCell className="px-5 font-medium tabular-nums text-slate-900">
                                                        {formatRupiah(
                                                            item.subtotal,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <div className="space-y-1">
                                                            <Badge
                                                                className={cn(
                                                                    'rounded-[6px] border font-medium',
                                                                    paymentStatusStyles[
                                                                        item.payment
                                                                            .status
                                                                            .code
                                                                    ],
                                                                )}
                                                            >
                                                                {
                                                                    item.payment
                                                                        .status
                                                                        .label
                                                                }
                                                            </Badge>
                                                            <p className="text-xs text-slate-500">
                                                                {
                                                                    item.payment
                                                                        .method
                                                                        .label
                                                                }
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <Badge
                                                            className={cn(
                                                                'rounded-full border font-medium',
                                                                statusStyles[
                                                                    item.status.code
                                                                ],
                                                            )}
                                                        >
                                                            {item.status.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="min-w-40 px-5 text-sm text-slate-500">
                                                        <time dateTime={item.created_at}>
                                                            {formatDate(item.created_at)}
                                                        </time>
                                                    </TableCell>
                                                    <TableCell className="px-5">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                asChild
                                                                variant="outline"
                                                                className="h-11 rounded-[12px] border-slate-200 bg-white px-3 font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                                                                aria-label={`Detail ${item.code ?? item.order_id}`}
                                                            >
                                                                {item.source ===
                                                                'online' ? (
                                                                    <Link
                                                                        href={ordersShow(
                                                                            item.id,
                                                                        )}
                                                                    >
                                                                        <Eye className="size-3.5" aria-hidden="true" />{' '}
                                                                        Detail
                                                                    </Link>
                                                                ) : (
                                                                    <Link
                                                                        href={
                                                                            item.detail_url ??
                                                                            '#'
                                                                        }
                                                                    >
                                                                        <Eye className="size-3.5" aria-hidden="true" />{' '}
                                                                        Detail
                                                                    </Link>
                                                                )}
                                                            </Button>
                                                            {item.source ===
                                                                'online' &&
                                                                !item.managed_by_up_jurusan &&
                                                                item.payment.status
                                                                    .code !==
                                                                    'paid' &&
                                                                item.status.code !==
                                                                    'cancelled' &&
                                                                item.status.code !==
                                                                    'completed' && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        className="h-11 rounded-[12px] border-[#BBF7D0] bg-white px-3 font-semibold text-[#16A34A] hover:bg-[#ECFDF3] transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#16A34A] focus-visible:ring-offset-2"
                                                                        disabled={
                                                                            paymentProcessingId ===
                                                                            item.id
                                                                        }
                                                                        onClick={() =>
                                                                            approvePayment(
                                                                                item,
                                                                            )
                                                                        }
                                                                        aria-label={`Tandai lunas ${item.code ?? item.order_id}`}
                                                                    >
                                                                        {paymentProcessingId === item.id ? (
                                                                            <Spinner className="size-3.5" aria-hidden="true" />
                                                                        ) : (
                                                                            <CheckCircle2 className="size-3.5" aria-hidden="true" />
                                                                        )}{' '}
                                                                        {paymentProcessingId ===
                                                                        item.id
                                                                            ? 'Memproses...'
                                                                            : 'Tandai lunas'}
                                                                    </Button>
                                                                )}
                                                            {item.managed_by_up_jurusan ? (
                                                                <Badge className="rounded-[6px] border border-slate-200 bg-slate-100 text-slate-700">
                                                                    Dikelola UP
                                                                    Jurusan
                                                                </Badge>
                                                            ) : nextActionFor(
                                                                  item,
                                                              ) ? (
                                                                <Button
                                                                    type="button"
                                                                    className="h-11 rounded-[12px] px-4 font-semibold transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                                                                    disabled={
                                                                        processingId ===
                                                                        item.id
                                                                    }
                                                                    onClick={() =>
                                                                        advanceStatus(
                                                                            item,
                                                                        )
                                                                    }
                                                                    aria-label={`${nextActionFor(item)?.action} ${item.code ?? item.order_id}`}
                                                                >
                                                                    {processingId ===
                                                                    item.id ? (
                                                                        <Spinner className="size-3.5" aria-hidden="true" />
                                                                    ) : null}
                                                                    {processingId ===
                                                                    item.id
                                                                        ? 'Memproses...'
                                                                        : nextActionFor(
                                                                              item,
                                                                          )?.action}
                                                                </Button>
                                                            ) : null}
                                                        </div>
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
                                                <div className="flex items-center justify-between gap-3">
                                                    <Skeleton className="h-4 w-24 rounded-[6px] motion-reduce:animate-none" />
                                                    <Skeleton className="h-5 w-16 rounded-full motion-reduce:animate-none" />
                                                </div>
                                                <Skeleton className="h-3 w-20 rounded-[6px] motion-reduce:animate-none" />
                                                <Skeleton className="h-4 w-3/4 rounded-[6px] motion-reduce:animate-none" />
                                                <div className="flex flex-wrap gap-2">
                                                    <Skeleton className="h-4 w-16 rounded-[6px] motion-reduce:animate-none" />
                                                    <Skeleton className="h-4 w-20 rounded-[6px] motion-reduce:animate-none" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Skeleton className="h-5 w-20 rounded-[6px] motion-reduce:animate-none" />
                                                    <Skeleton className="h-5 w-16 rounded-full motion-reduce:animate-none" />
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
                                            icon={ShoppingCart}
                                            title="Tidak ada pesanan"
                                            description="Belum ada pesanan yang sesuai filter. Coba ubah kata kunci atau reset filter untuk melihat semua pesanan."
                                            actionHref={ordersIndex().url}
                                            actionLabel="Reset"
                                        />
                                    </div>
                                ) : (
                                    sortedData.map((item) => (
                                        <Card
                                            key={`mobile-${item.id}`}
                                            className="rounded-[14px] border-slate-100 p-4 shadow-sm transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-md motion-reduce:transition-none motion-reduce:hover:shadow-sm"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-slate-950" title={item.code ?? `#${item.order_id}`}>
                                                        {item.code ?? `#${item.order_id}`}
                                                    </p>
                                                    <p className="mt-1 truncate text-xs text-slate-500">{item.buyer.name}</p>
                                                    {item.source === 'offline' && (
                                                        <Badge className="mt-1.5 rounded-[6px] border border-[#BBF7D0] bg-[#ECFDF3] text-[#16A34A] text-[11px]">
                                                            Offline/POS
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Badge className={cn('shrink-0 rounded-full border text-xs font-medium', statusStyles[item.status.code])}>
                                                    {item.status.label}
                                                </Badge>
                                            </div>

                                            <div className="mt-3">
                                                <p className="line-clamp-2 text-sm font-medium text-slate-900">{item.product_name}</p>
                                                {item.is_pre_order && (
                                                    <p className="mt-1 text-xs font-medium text-[#0080FF]">
                                                        PO {item.pre_order_estimate_days} hari
                                                        {item.pre_order_deadline ? ` • Deadline ${item.pre_order_deadline}` : ''}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                                                <span className="text-xs text-slate-500">Qty {item.quantity}</span>
                                                <span className="text-slate-300" aria-hidden="true">•</span>
                                                <span className="font-semibold tabular-nums text-slate-900">{formatRupiah(item.subtotal)}</span>
                                            </div>

                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                <Badge className={cn('rounded-[6px] border text-xs font-medium', paymentStatusStyles[item.payment.status.code])}>
                                                    {item.payment.status.label}
                                                </Badge>
                                                <span className="text-xs text-slate-500">{item.payment.method.label}</span>
                                            </div>

                                            <p className="mt-3 text-xs text-slate-500">
                                                <time dateTime={item.created_at}>{formatDate(item.created_at)}</time>
                                            </p>

                                            <div className="mt-4 flex flex-col gap-2">
                                                <div className="flex gap-2">
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        className="h-11 flex-1 rounded-[12px] border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                                                        aria-label={`Detail ${item.code ?? item.order_id}`}
                                                    >
                                                        {item.source === 'online' ? (
                                                            <Link href={ordersShow(item.id)}>
                                                                <Eye className="size-3.5" aria-hidden="true" /> Detail
                                                            </Link>
                                                        ) : (
                                                            <Link href={item.detail_url ?? '#'}>
                                                                <Eye className="size-3.5" aria-hidden="true" /> Detail
                                                            </Link>
                                                        )}
                                                    </Button>
                                                    {item.source === 'online' &&
                                                        !item.managed_by_up_jurusan &&
                                                        item.payment.status.code !== 'paid' &&
                                                        item.status.code !== 'cancelled' &&
                                                        item.status.code !== 'completed' && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="h-11 flex-1 rounded-[12px] border-[#BBF7D0] bg-white font-semibold text-[#16A34A] hover:bg-[#ECFDF3] transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#16A34A] focus-visible:ring-offset-2"
                                                                disabled={paymentProcessingId === item.id}
                                                                onClick={() => approvePayment(item)}
                                                                aria-label={`Tandai lunas ${item.code ?? item.order_id}`}
                                                            >
                                                                {paymentProcessingId === item.id ? (
                                                                    <Spinner className="size-3.5" aria-hidden="true" />
                                                                ) : (
                                                                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                                                                )}
                                                                {paymentProcessingId === item.id ? 'Memproses...' : 'Tandai lunas'}
                                                            </Button>
                                                        )}
                                                </div>
                                                {item.managed_by_up_jurusan ? (
                                                    <Badge className="w-fit rounded-[6px] border border-slate-200 bg-slate-100 text-slate-700">Dikelola UP Jurusan</Badge>
                                                ) : nextActionFor(item) ? (
                                                    <Button
                                                        type="button"
                                                        className="h-11 w-full rounded-[12px] font-semibold transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                                                        disabled={processingId === item.id}
                                                        onClick={() => advanceStatus(item)}
                                                        aria-label={`${nextActionFor(item)?.action} ${item.code ?? item.order_id}`}
                                                    >
                                                        {processingId === item.id ? <Spinner className="size-3.5" aria-hidden="true" /> : null}
                                                        {processingId === item.id ? 'Memproses...' : nextActionFor(item)?.action}
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>

                            {orderItems.last_page > 1 && (
                                <div className="flex items-center justify-between border-t border-slate-100 p-4">
                                    <span className="text-sm text-slate-500">
                                        Halaman {orderItems.current_page} dari{' '}
                                        {orderItems.last_page}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button
                                            asChild={Boolean(
                                                orderItems.prev_page_url,
                                            )}
                                            disabled={!orderItems.prev_page_url}
                                            variant="outline"
                                            className="h-11 rounded-[12px] border-slate-200 bg-white font-semibold transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                                        >
                                            {orderItems.prev_page_url ? (
                                                <Link
                                                    href={
                                                        orderItems.prev_page_url
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
                                                orderItems.next_page_url,
                                            )}
                                            disabled={!orderItems.next_page_url}
                                            variant="outline"
                                            className="h-11 rounded-[12px] border-slate-200 bg-white font-semibold transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                                        >
                                            {orderItems.next_page_url ? (
                                                <Link
                                                    href={
                                                        orderItems.next_page_url
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
        </>
    );
}

SellerOrdersIndex.layout = {
    breadcrumbs: [{ title: 'Pesanan', href: ordersIndex() }],
};
