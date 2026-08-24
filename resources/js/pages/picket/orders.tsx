import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, ClipboardList, Loader2, ReceiptText, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/admin-jurusan/empty-state';
import { PageHeader } from '@/components/admin-jurusan/page-header';
import { FlashAlert } from '@/components/picket/flash-alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

type OrderStatus = 'pending' | 'packed' | 'sent' | 'completed' | 'cancelled';
type PaymentStatus = 'unpaid' | 'pending_confirmation' | 'paid' | 'rejected';

type PicketOrderItem = {
    id: number;
    code: string;
    order_id: number;
    buyer_name: string;
    seller_name: string;
    product_name: string;
    quantity: number;
    subtotal: number;
    status: { code: OrderStatus; label: string };
    payment: {
        status: { code: PaymentStatus; label: string };
        method: { code: string; label: string };
        confirmed_at: string | null;
        rejection_reason: string | null;
    };
    cancelled_at?: string | null;
};

type Props = {
    daily_report: {
        date: string;
        total_sold: number;
        total_revenue: number;
    };
    order_items: PicketOrderItem[];
};

const statusStyles: Record<OrderStatus, string> = {
    pending: 'bg-[#EFF8FF] text-[#0080FF] ring-1 ring-blue-200',
    packed: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    sent: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
    completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
};

const paymentStatusStyles: Record<PaymentStatus, string> = {
    unpaid: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
    pending_confirmation: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    paid: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
};

const nextStatus: Record<Exclude<OrderStatus, 'sent' | 'completed' | 'cancelled'>, { code: OrderStatus; action: string }> = {
    pending: { code: 'packed', action: 'Tandai dikemas' },
    packed: { code: 'sent', action: 'Tandai dikirim' },
};

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

const statusFilters = [
    { value: 'all', label: 'Semua' },
    { value: 'pending', label: 'Menunggu' },
    { value: 'packed', label: 'Dikemas' },
    { value: 'sent', label: 'Dikirim' },
    { value: 'completed', label: 'Selesai' },
    { value: 'cancelled', label: 'Batal' },
] as const;

export default function PicketOrders({ daily_report, order_items }: Props) {
    const { flash } = usePage().props as unknown as {
        flash: { success?: string; error?: string };
    };
    const [processingId, setProcessingId] = useState<number>();
    const [paymentProcessingId, setPaymentProcessingId] = useState<number>();
    const [statusError, setStatusError] = useState<string>();
    const [paymentError, setPaymentError] = useState<string>();
    const [q, setQ] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filtered = useMemo(() => {
        return order_items.filter((item) => {
            const matchStatus = statusFilter === 'all' || item.status.code === statusFilter;
            const keyword = q.trim().toLowerCase();
            const matchSearch =
                !keyword ||
                item.code.toLowerCase().includes(keyword) ||
                item.product_name.toLowerCase().includes(keyword) ||
                item.buyer_name.toLowerCase().includes(keyword) ||
                item.seller_name.toLowerCase().includes(keyword);

            return matchStatus && matchSearch;
        });
    }, [order_items, q, statusFilter]);

    const counts = useMemo(() => {
        const c: Record<string, number> = { all: order_items.length };
        order_items.forEach((i) => {
            c[i.status.code] = (c[i.status.code] ?? 0) + 1;
        });

        return c;
    }, [order_items]);

    const advanceStatus = (item: PicketOrderItem) => {
        if (item.status.code === 'sent' || item.status.code === 'completed' || item.status.code === 'cancelled') {
return;
}

        setStatusError(undefined);
        router.put(
            `/picket/orders/${item.id}/status`,
            { status: nextStatus[item.status.code].code },
            {
                preserveScroll: true,
                onStart: () => setProcessingId(item.id),
                onFinish: () => setProcessingId(undefined),
                onError: (errors) => setStatusError(errors.status),
            },
        );
    };

    const approvePayment = (item: PicketOrderItem) => {
        if (item.payment.status.code === 'paid') {
return;
}

        setPaymentError(undefined);
        router.post(
            `/picket/orders/${item.id}/payment/approve`,
            {},
            {
                preserveScroll: true,
                onStart: () => setPaymentProcessingId(item.id),
                onFinish: () => setPaymentProcessingId(undefined),
                onError: (errors) => setPaymentError(errors.payment),
            },
        );
    };

    return (
        <>
            <Head title="Orders Picket" />
            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    badge={daily_report.date}
                    badgeIcon={ReceiptText}
                    title="Orders Titipan UP"
                    description="Kelola status pengiriman dan konfirmasi pelunasan tunai untuk produk titipan. Bayar diverifikasi picket, bukan seller."
                    actions={
                        <Button asChild variant="outline" className="rounded-xl">
                            <Link href="/picket/pos">
                                <ArrowLeft className="size-4" />
                                Kembali ke POS
                            </Link>
                        </Button>
                    }
                />

                <FlashAlert success={flash.success} error={flash.error} />
                {(statusError || paymentError) && (
                    <FlashAlert error={statusError || paymentError} />
                )}

                <Card className="rounded-xl border-slate-200 shadow-sm">
                    <CardContent className="flex flex-col gap-4 p-5">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-wrap gap-2">
                                {statusFilters.map((f) => (
                                    <button
                                        key={f.value}
                                        onClick={() => setStatusFilter(f.value)}
                                        className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0080FF]/30 ${
                                            statusFilter === f.value
                                                ? 'border-[#0080FF] bg-[#0080FF] text-white shadow-sm'
                                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                        }`}
                                        aria-pressed={statusFilter === f.value}
                                    >
                                        {f.label}{' '}
                                        <Badge
                                            variant="secondary"
                                            className={`ml-1.5 rounded-full px-1.5 py-0 text-[11px] ${statusFilter === f.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}
                                        >
                                            {counts[f.value] ?? 0}
                                        </Badge>
                                    </button>
                                ))}
                            </div>
                            <div className="relative w-full sm:max-w-sm">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Cari kode, produk, pembeli, seller..."
                                    className="h-11 rounded-xl border-slate-200 bg-white pl-9"
                                    aria-label="Cari order titipan"
                                />
                                {q && (
                                    <button
                                        type="button"
                                        onClick={() => setQ('')}
                                        className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                        aria-label="Hapus pencarian"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                        {(q || statusFilter !== 'all') && (
                            <p className="text-xs text-slate-500">
                                Menampilkan {filtered.length} dari {order_items.length} item
                                {q && <> untuk “{q}”</>} • Status: {statusFilters.find((f) => f.value === statusFilter)?.label}
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
                    <CardContent className="p-0">
                        <div className="grid gap-0 border-b border-slate-100 bg-slate-50/60 p-5 sm:grid-cols-2">
                            <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                                <p className="text-xs font-medium text-slate-500">Total item POS hari ini</p>
                                <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">{daily_report.total_sold}</p>
                            </div>
                            <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                                <p className="text-xs font-medium text-slate-500">Total omzet POS</p>
                                <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">{formatRupiah(daily_report.total_revenue)}</p>
                            </div>
                        </div>

                        {order_items.length === 0 ? (
                            <EmptyState
                                icon={ClipboardList}
                                title="Belum ada order titipan UP"
                                description="Order titipan muncul setelah buyer checkout produk yang dititip ke UP Jurusanmu. Cek POS untuk transaksi tunai langsung."
                            />
                        ) : filtered.length === 0 ? (
                            <EmptyState
                                icon={Search}
                                title="Tidak ada hasil"
                                description={`Tidak ada order dengan status "${statusFilters.find((f) => f.value === statusFilter)?.label}" dan kata kunci "${q}".`}
                            />
                        ) : (
                            <>
                                {/* Desktop table */}
                                <div className="hidden md:block">
                                    <Table className="[&_tbody_tr:nth-child(even)]:bg-slate-50/70">
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Transaksi</TableHead>
                                                <TableHead>Produk</TableHead>
                                                <TableHead>Pembeli</TableHead>
                                                <TableHead className="text-right">Qty</TableHead>
                                                <TableHead className="text-right">Subtotal</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Pembayaran</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filtered.map((item) => (
                                                <TableRow key={item.id} className="hover:bg-[#EFF8FF]/50">
                                                    <TableCell className="font-semibold text-slate-900">{item.code}</TableCell>
                                                    <TableCell className="min-w-64 whitespace-normal">
                                                        <p className="font-semibold leading-5 text-slate-900">{item.product_name}</p>
                                                        <p className="mt-1 text-xs text-slate-500">Seller {item.seller_name}</p>
                                                    </TableCell>
                                                    <TableCell className="min-w-40 whitespace-normal text-sm text-slate-700">{item.buyer_name}</TableCell>
                                                    <TableCell className="text-right tabular-nums text-sm">{item.quantity} item</TableCell>
                                                    <TableCell className="text-right font-bold tabular-nums text-slate-900">{formatRupiah(item.subtotal)}</TableCell>
                                                    <TableCell>
                                                        <Badge className={cn('rounded-full px-2.5 py-1 text-xs', statusStyles[item.status.code])}>
                                                            {item.status.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <Badge className={cn('rounded-full px-2.5 py-1 text-xs', paymentStatusStyles[item.payment.status.code])}>
                                                                {item.payment.status.label}
                                                            </Badge>
                                                            <p className="text-xs text-slate-500">{item.payment.method.label}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {item.payment.status.code !== 'paid' &&
                                                                item.status.code !== 'cancelled' &&
                                                                item.status.code !== 'completed' && (
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="outline"
                                                                        disabled={paymentProcessingId === item.id}
                                                                        onClick={() => approvePayment(item)}
                                                                        className="h-9 rounded-full border-emerald-200 bg-white px-3 text-emerald-700 hover:bg-emerald-50"
                                                                    >
                                                                        {paymentProcessingId === item.id ? (
                                                                            <Loader2 className="size-3.5 animate-spin" />
                                                                        ) : (
                                                                            <CheckCircle2 className="size-3.5" />
                                                                        )}
                                                                        {paymentProcessingId === item.id ? 'Memproses...' : 'Tandai lunas'}
                                                                    </Button>
                                                                )}
                                                            {item.status.code === 'pending' || item.status.code === 'packed' ? (
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    disabled={processingId === item.id}
                                                                    onClick={() => advanceStatus(item)}
                                                                    className="h-9 rounded-full px-4 font-semibold"
                                                                >
                                                                    {processingId === item.id ? (
                                                                        <Loader2 className="size-3.5 animate-spin" />
                                                                    ) : null}
                                                                    {processingId === item.id ? 'Memproses...' : nextStatus[item.status.code].action}
                                                                </Button>
                                                            ) : (
                                                                <span
                                                                    className={cn(
                                                                        'inline-flex h-9 items-center rounded-full px-3 text-xs font-semibold ring-1',
                                                                        item.status.code === 'completed'
                                                                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                                                            : item.status.code === 'cancelled'
                                                                              ? 'bg-rose-50 text-rose-700 ring-rose-200'
                                                                              : 'bg-indigo-50 text-indigo-700 ring-indigo-200',
                                                                    )}
                                                                >
                                                                    {item.status.code === 'completed'
                                                                        ? 'Selesai'
                                                                        : item.status.code === 'cancelled'
                                                                          ? 'Batal'
                                                                          : 'Menunggu buyer'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile cards */}
                                <div className="divide-y divide-slate-100 md:hidden">
                                    {filtered.map((item) => (
                                        <div key={item.id} className="space-y-3 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-bold text-slate-900">{item.code}</p>
                                                    <p className="truncate text-sm font-semibold leading-5 text-slate-900">{item.product_name}</p>
                                                    <p className="truncate text-xs text-slate-500">Seller {item.seller_name} • {item.buyer_name}</p>
                                                </div>
                                                <Badge className={cn('shrink-0 rounded-full px-2.5 py-1 text-xs', statusStyles[item.status.code])}>
                                                    {item.status.label}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-sm">
                                                <span className="text-slate-500">{item.quantity} item</span>
                                                <span className="font-bold tabular-nums text-slate-900">{formatRupiah(item.subtotal)}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <Badge className={cn('rounded-full px-2.5 py-1 text-xs', paymentStatusStyles[item.payment.status.code])}>
                                                    {item.payment.status.label}
                                                </Badge>
                                                <span className="text-xs text-slate-500">{item.payment.method.label}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {item.payment.status.code !== 'paid' &&
                                                    item.status.code !== 'cancelled' &&
                                                    item.status.code !== 'completed' && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={paymentProcessingId === item.id}
                                                            onClick={() => approvePayment(item)}
                                                            className="h-11 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                                        >
                                                            <CheckCircle2 className="size-4" />
                                                            {paymentProcessingId === item.id ? '...' : 'Tandai lunas'}
                                                        </Button>
                                                    )}
                                                {item.status.code === 'pending' || item.status.code === 'packed' ? (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        disabled={processingId === item.id}
                                                        onClick={() => advanceStatus(item)}
                                                        className="h-11 rounded-xl font-semibold"
                                                    >
                                                        {processingId === item.id ? <Loader2 className="size-4 animate-spin" /> : null}
                                                        {processingId === item.id ? '...' : nextStatus[item.status.code].action}
                                                    </Button>
                                                ) : (
                                                    <div className="col-span-2 grid place-items-center rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                                                        {item.status.code === 'completed' ? 'Selesai' : item.status.code === 'cancelled' ? 'Batal' : 'Menunggu buyer'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

PicketOrders.layout = {
    breadcrumbs: [{ title: 'Pesanan', href: '/picket/orders' }],
};
