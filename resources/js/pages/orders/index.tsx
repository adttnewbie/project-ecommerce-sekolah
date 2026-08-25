import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Eye, Package, ShoppingCart } from 'lucide-react';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { home } from '@/routes';
import { index as ordersIndex, show as orderShow } from '@/routes/orders';

type BuyerOrder = {
    id: number;
    code: string;
    status: { code: string; label: string };
    payment: {
        status: { code: string; label: string };
        method: { code: string; label: string };
        proof_url: string | null;
        confirmed_at: string | null;
        rejection_reason: string | null;
    };
    total_price: number;
    items_count: number;
    items: {
        id: number;
        product_name: string;
        quantity: number;
        subtotal: number;
        is_pre_order: boolean;
        pre_order_estimate_days: number | null;
        pre_order_deadline: string | null;
        pre_order_min_quantity: number | null;
        pre_order_note: string | null;
        status: { code: string; label: string };
        seller: { id: number; name: string };
    }[];
    created_at: string | null;
};

type ActiveSanction = {
    type: { code: string; label: string };
    reason: string | null;
    ends_at: string | null;
};

type Props = {
    orders: {
        data: BuyerOrder[];
        from: number | null;
        to: number | null;
        total: number;
    };
    active_sanction: ActiveSanction | null;
};

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

const formatDate = (value: string | null) =>
    value
        ? new Intl.DateTimeFormat('id-ID', {
              dateStyle: 'medium',
              timeStyle: 'short',
          }).format(new Date(value))
        : '-';

export default function BuyerOrdersIndex({ orders, active_sanction }: Props) {
    return (
        <>
            <Head title="Orders Saya" />
            <main className="min-h-[calc(100svh-4rem)] bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-7xl space-y-6">
                    <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div>
                            <Badge className="mb-2 rounded-[6px] bg-[#EFF8FF] text-[#0080FF] ring-1 ring-[#BCE0FF]">
                                <ShoppingCart className="size-3.5" />
                                {orders.total} order
                            </Badge>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Orders Saya
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Riwayat pesanan dan status item yang dibeli.
                            </p>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            className="h-11 w-fit rounded-[12px] border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
                        >
                            <Link href={home()}>
                                <ArrowLeft className="size-4" />
                                Home
                            </Link>
                        </Button>
                    </section>

                    {active_sanction && (
                        <div className="flex items-start gap-3 rounded-[12px] border border-amber-200 bg-amber-50 p-4">
                            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
                            <div className="space-y-1 text-sm">
                                <p className="font-semibold text-amber-800">
                                    Sanksi aktif: {active_sanction.type.label}
                                    {active_sanction.ends_at &&
                                        ` — sampai ${formatDate(active_sanction.ends_at)}`}
                                </p>
                                {active_sanction.reason && (
                                    <p className="text-amber-700">
                                        {active_sanction.reason}
                                    </p>
                                )}
                                {active_sanction.type.code !== 'warning' && (
                                    <p className="text-amber-700">
                                        Checkout dan/atau memberi ulasan
                                        dinonaktifkan selama sanksi berlaku.
                                        Hubungi admin untuk informasi lebih
                                        lanjut.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <Card className="gap-0 rounded-[14px] border border-slate-200 bg-white py-0 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                        <CardHeader className="border-b border-slate-100 p-6">
                            <CardTitle className="font-bold text-slate-900">Daftar Order</CardTitle>
                            <CardDescription>
                                {orders.from ?? 0}-{orders.to ?? 0} dari{' '}
                                {orders.total} order
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="space-y-3 p-4 xl:hidden">
                                {orders.data.length === 0 && (
                                    <div className="rounded-[14px] border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
                                        <Package className="mx-auto size-8 text-slate-400" />
                                        <p className="mt-3 text-base font-bold text-slate-900">
                                            Belum ada order
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">Riwayat pesananmu akan tampil di sini.</p>
                                        <Button
                                            asChild
                                            className="mt-4 h-11 rounded-[12px] px-6"
                                        >
                                            <Link href={home()}>
                                                Mulai Belanja
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {orders.data.map((order) => (
                                    <Link
                                        key={order.id}
                                        href={orderShow(order.id)}
                                        className="block rounded-[14px] border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition hover:border-[#BCE0FF] hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-bold text-slate-900">
                                                    {order.code}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {formatDate(
                                                        order.created_at,
                                                    )}
                                                </p>
                                            </div>
                                            <Badge className="rounded-full bg-[#EFF8FF] px-2.5 py-0.5 text-[#0080FF] ring-1 ring-[#BCE0FF]">
                                                {order.status.label}
                                            </Badge>
                                        </div>
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <Badge
                                                className={
                                                    paymentStatusClass[
                                                        order.payment.status
                                                            .code
                                                    ] ??
                                                    'rounded-[6px] bg-slate-100 text-slate-700'
                                                }
                                            >
                                                {order.payment.status.label}
                                            </Badge>
                                            <span className="text-xs font-medium text-slate-500">
                                                {order.payment.method.label}
                                            </span>
                                        </div>
                                        <div className="mt-4 space-y-1">
                                            {order.items.map((item) => (
                                                <p
                                                    key={item.id}
                                                    className="line-clamp-1 text-sm text-slate-600"
                                                >
                                                    {item.product_name} x
                                                    {item.quantity}
                                                    {item.is_pre_order &&
                                                        ` • PO ${item.pre_order_estimate_days} hari`}
                                                </p>
                                            ))}
                                            {order.items_count >
                                                order.items.length && (
                                                <p className="text-xs text-slate-500">
                                                    +
                                                    {order.items_count -
                                                        order.items.length}{' '}
                                                    item lain
                                                </p>
                                            )}
                                        </div>
                                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                                            <span className="text-sm text-slate-500">
                                                Total
                                            </span>
                                            <span className="font-bold text-slate-900 tabular-nums">
                                                {formatRupiah(
                                                    order.total_price,
                                                )}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            <div className="hidden overflow-x-auto xl:block">
                                <Table className="min-w-[680px] w-full">
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            {[
                                                'Order',
                                                'Item',
                                                'Total',
                                                'Payment',
                                                'Status',
                                                'Waktu',
                                                'Aksi',
                                            ].map((heading) => (
                                                <TableHead
                                                    key={heading}
                                                    className="px-5"
                                                >
                                                    {heading}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.data.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={7}
                                                    className="py-12 text-center"
                                                >
                                                    <Package className="mx-auto size-8 text-slate-400" />
                                                    <p className="mt-3 text-base font-bold text-slate-900">
                                                        Belum ada order
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-500">Riwayat pesananmu akan tampil di sini.</p>
                                                    <Button
                                                        asChild
                                                        className="mt-4 h-11 rounded-[12px] px-6"
                                                    >
                                                        <Link href={home()}>
                                                            Mulai Belanja
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {orders.data.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="px-5 font-bold text-slate-900">
                                                    {order.code}
                                                </TableCell>
                                                <TableCell className="px-5">
                                                    <div className="space-y-1">
                                                        {order.items.map(
                                                            (item) => (
                                                                <div
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    className="text-sm"
                                                                >
                                                                    {
                                                                        item.product_name
                                                                    }{' '}
                                                                    x
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                    {item.is_pre_order &&
                                                                        ` • PO ${item.pre_order_estimate_days} hari`}
                                                                </div>
                                                            ),
                                                        )}
                                                        {order.items_count >
                                                            order.items
                                                                .length && (
                                                            <div className="text-xs text-slate-500">
                                                                +
                                                                {order.items_count -
                                                                    order.items
                                                                        .length}{' '}
                                                                item lain
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-5">
                                                    {formatRupiah(
                                                        order.total_price,
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-5">
                                                    <div className="space-y-1">
                                                        <Badge
                                                            className={
                                                                paymentStatusClass[
                                                                    order
                                                                        .payment
                                                                        .status
                                                                        .code
                                                                ] ??
                                                                'rounded-[6px] bg-slate-100 text-slate-700'
                                                            }
                                                        >
                                                            {
                                                                order.payment
                                                                    .status
                                                                    .label
                                                            }
                                                        </Badge>
                                                        <p className="text-xs text-slate-500">
                                                            {
                                                                order.payment
                                                                    .method
                                                                    .label
                                                            }
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-5">
                                                    <Badge className="rounded-[6px] bg-[#EFF8FF] px-2 py-0.5 text-[#0080FF] ring-1 ring-[#BCE0FF]">
                                                        {order.status.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-5">
                                                    {formatDate(
                                                        order.created_at,
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-4">
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="icon"
                                                        className="size-9 rounded-[10px] border-slate-200 bg-white"
                                                    >
                                                        <Link
                                                            href={orderShow(
                                                                order.id,
                                                            )}
                                                            aria-label={`Lihat order ${order.code}`}
                                                            title={`Lihat order ${order.code}`}
                                                        >
                                                            <Eye className="size-4" />
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    );
}

BuyerOrdersIndex.layout = {
    breadcrumbs: [{ title: 'Orders', href: ordersIndex() }],
};

const paymentStatusClass: Record<string, string> = {
    unpaid: 'rounded-[6px] bg-slate-100 text-slate-700 ring-1 ring-slate-200',
    pending_confirmation: 'rounded-[6px] bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    paid: 'rounded-[6px] bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    rejected: 'rounded-[6px] bg-[#FEF2F2] text-[#DC2626] ring-1 ring-red-200',
};
