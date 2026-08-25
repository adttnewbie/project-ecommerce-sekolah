import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    ExternalLink,
    ShoppingCart,
    Store,
    XCircle,
} from 'lucide-react';
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
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { formatDateID } from '@/lib/pre-order';
import { index as ordersIndex } from '@/routes/orders';

type BuyerOrder = {
    id: number;
    code: string;
    status: { code: string; label: string };
    can_complete: boolean;
    can_cancel: boolean;
    cancelled_at: string | null;
    cancel_reason: string | null;
    cancellable_items: Array<{
        id: number;
        name: string;
        quantity: number;
    }>;
    payment: {
        status: { code: string; label: string };
        method: { code: string; label: string };
        proof_url: string | null;
        confirmed_at: string | null;
        rejection_reason: string | null;
    };
    total_price: number;
    delivery_fee: number;
    delivery_fee_min_spend: number | null;
    items_total: number;
    items: {
        id: number;
        product_name: string;
        price: number;
        quantity: number;
        subtotal: number;
        is_pre_order: boolean;
        pre_order_estimate_days: number | null;
        pre_order_deadline: string | null;
        pre_order_min_quantity: number | null;
        pre_order_note: string | null;
        status: { code: string; label: string };
        payment: {
            status: { code: string; label: string };
            method: { code: string; label: string };
        };
        seller: { id: number; name: string };
    }[];
    created_at: string | null;
};

type Props = {
    order: BuyerOrder;
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

export default function BuyerOrdersShow({ order }: Props) {
    const { flash } = usePage().props;

    const getCancelStatusMessage = () => {
        if (order.items.every((item) => item.payment.status.code === 'paid')) {
            return 'Semua item sudah dibayar dan tidak dapat dibatalkan.';
        }

        const hasUnpaidItems = order.cancellable_items.length > 0;

        if (!hasUnpaidItems) {
            return 'Tidak ada item yang dapat dibatalkan karena status sudah final.';
        }

        return `Dapat membatalkan ${order.cancellable_items.length} item berikut:`;
    };

    return (
        <>
            <Head title={`Order ${order.code}`} />
            <main className="min-h-[calc(100svh-4rem)] bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-7xl space-y-6">
                    <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div>
                            <Badge className="mb-2 rounded-[6px] bg-[#EFF8FF] px-2.5 py-0.5 text-[#0080FF] ring-1 ring-[#BCE0FF]">
                                <ShoppingCart className="size-3.5" />
                                {order.code}
                            </Badge>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Detail Order
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Dibuat pada {formatDate(order.created_at)}.
                            </p>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            className="h-11 w-fit rounded-[12px] border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
                        >
                            <Link href={ordersIndex()}>
                                <ArrowLeft className="size-4" />
                                Orders
                            </Link>
                        </Button>
                    </section>

                    {(flash.success || flash.error) && (
                        <div
                            role="status"
                            className={`rounded-[10px] border px-4 py-3 text-sm shadow-[0_1px_2px_rgba(15,23,42,0.05)] ${
                                flash.error
                                    ? 'border-red-200 bg-[#FEF2F2] text-[#DC2626]'
                                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            }`}
                        >
                            {flash.error || flash.success}
                        </div>
                    )}

                    <Card className="rounded-[14px] border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                        <CardHeader>
                            <CardTitle className="font-bold text-slate-900">Ringkasan</CardTitle>
                            <CardDescription>
                                Status order dan total transaksi.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-4">
                            <div>
                                <p className="text-sm text-slate-500">Status</p>
                                <Badge className="mt-2 rounded-[6px] bg-[#EFF8FF] px-2.5 py-0.5 text-[#0080FF] ring-1 ring-[#BCE0FF]">
                                    {order.status.label}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">
                                    Total item
                                </p>
                                <p className="mt-1 text-lg font-bold text-slate-900 tabular-nums">
                                    {order.items.length}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">
                                    Pembayaran
                                </p>
                                <Badge
                                    className={
                                        paymentStatusClass[
                                            order.payment.status.code
                                        ] ??
                                        'mt-2 rounded-[6px] bg-slate-100 text-slate-700 ring-1 ring-slate-200'
                                    }
                                >
                                    {order.payment.status.label}
                                </Badge>
                                <p className="mt-2 text-xs text-slate-500">
                                    {order.payment.method.label}
                                </p>
                                {order.payment.proof_url && (
                                    <a
                                        href={order.payment.proof_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#0080FF] hover:text-[#006FE0]"
                                    >
                                        <ExternalLink className="size-3.5" />
                                        Bukti bayar
                                    </a>
                                )}
                                {order.payment.rejection_reason && (
                                    <p className="mt-2 rounded-[6px] border border-red-200 bg-[#FEF2F2] px-2 py-1 text-xs leading-4 text-[#DC2626]">
                                        {order.payment.rejection_reason}
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">
                                    Total harga
                                </p>
                                {order.delivery_fee > 0 ? (
                                    <>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Subtotal{' '}
                                            {formatRupiah(order.items_total)}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            Biaya antar{' '}
                                            {formatRupiah(order.delivery_fee)}
                                            {order.delivery_fee_min_spend !==
                                                null &&
                                                order.delivery_fee_min_spend >
                                                    0 &&
                                                ` • belanja min. ${formatRupiah(order.delivery_fee_min_spend)}`}
                                        </p>
                                        <p className="mt-1 text-lg font-bold tracking-tight text-slate-900 tabular-nums">
                                            {formatRupiah(order.total_price)}
                                        </p>
                                    </>
                                ) : (
                                    <p className="mt-1 text-lg font-bold tracking-tight text-slate-900 tabular-nums">
                                        {formatRupiah(order.total_price)}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                        {order.can_complete && (
                            <div className="border-t border-slate-100 px-6 pb-6">
                                <Form
                                    action={`/orders/${order.id}/complete`}
                                    method="post"
                                    className="mt-5"
                                >
                                    {({ processing }) => (
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-11 rounded-[12px] w-fit bg-emerald-600 shadow-[0_1px_2px_rgba(15,23,42,0.05)] hover:bg-emerald-700"
                                        >
                                            <CheckCircle2 className="size-4" />
                                            {processing
                                                ? 'Memproses...'
                                                : 'Pesanan diterima'}
                                        </Button>
                                    )}
                                </Form>
                                <p className="mt-2 text-xs text-slate-500">
                                    Klik setelah barang sudah diterima agar
                                    status pesanan menjadi selesai.
                                </p>
                            </div>
                        )}
                        {order.can_cancel && !order.cancelled_at && (
                            <div className="border-t border-slate-100 px-6 pb-6">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            className="h-11 rounded-[12px] w-fit"
                                        >
                                            <XCircle className="size-4" />
                                            Batalkan Pesanan
                                        </Button>
                                    </DialogTrigger>

                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>
                                                Batalkan Pesanan
                                            </DialogTitle>
                                            <DialogDescription>
                                                {getCancelStatusMessage()}
                                            </DialogDescription>
                                        </DialogHeader>

                                        <Form
                                            action={`/orders/${order.id}/cancel`}
                                            method="post"
                                            className="space-y-4"
                                        >
                                            <div className="space-y-2">
                                                <Label htmlFor="cancel_reason">
                                                    Alasan Pembatalan
                                                </Label>
                                                <Textarea
                                                    id="cancel_reason"
                                                    name="cancel_reason"
                                                    placeholder="Contoh: Perubahan rencana, tidak memerlukan barang lagi, salah pilih varian..."
                                                    required
                                                    minLength={10}
                                                    maxLength={1000}
                                                    rows={4}
                                                    className="resize-none"
                                                />
                                                <p className="text-xs text-slate-500">
                                                    Alasan wajib diisi minimal
                                                    10 karakter
                                                </p>

                                                {order.cancellable_items
                                                    .length > 0 && (
                                                    <div className="mt-3 rounded-[14px] border border-slate-200 bg-slate-50 p-3">
                                                        <p className="mb-2 text-xs font-semibold text-slate-700">
                                                            Item yang akan
                                                            dibatalkan:
                                                        </p>
                                                        <ul className="space-y-1">
                                                            {order.cancellable_items.map(
                                                                (item) => (
                                                                    <li
                                                                        key={
                                                                            item.id
                                                                        }
                                                                        className="flex items-start gap-2 text-sm text-slate-600"
                                                                    >
                                                                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                                                                        <span>
                                                                            {
                                                                                item.name
                                                                            }
                                                                        </span>
                                                                        <span className="text-slate-400">
                                                                            •
                                                                        </span>
                                                                            <span className="tabular-nums">
                                                                            x
                                                                            {
                                                                                item.quantity
                                                                            }
                                                                        </span>
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            <DialogFooter
                                                showCloseButton={false}
                                            >
                                                <DialogClose asChild>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                    >
                                                        Batal
                                                    </Button>
                                                </DialogClose>
                                                <Button
                                                    type="submit"
                                                    variant="destructive"
                                                >
                                                    Konfirmasi Pembatalan
                                                </Button>
                                            </DialogFooter>
                                        </Form>
                                    </DialogContent>
                                </Dialog>

                                <p className="mt-3 text-xs text-slate-500">
                                    Pembatalan hanya dapat dilakukan untuk item
                                    yang belum dibayar dan status belum final.
                                </p>
                            </div>
                        )}
                    </Card>

                    <Card className="gap-0 rounded-[14px] border border-slate-200 bg-white py-0 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                        <CardHeader className="border-b border-slate-100 p-6">
                            <CardTitle className="font-bold text-slate-900">Item Order</CardTitle>
                            <CardDescription>
                                Produk yang dibeli dalam order ini.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="space-y-3 p-4 md:hidden">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-[14px] border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="line-clamp-2 font-bold text-slate-900">
                                                    {item.product_name}
                                                </p>
                                                {item.is_pre_order && (
                                                    <p className="mt-1 text-xs font-medium text-[#0080FF]">
                                                        PO{' '}
                                                        {
                                                            item.pre_order_estimate_days
                                                        }{' '}
                                                        hari
                                                        {item.pre_order_deadline &&
                                                            ` • Deadline ${formatDateID(item.pre_order_deadline)}`}
                                                    </p>
                                                )}
                                                <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-500">
                                                    <Store className="size-3.5" />
                                                    {item.seller.name}
                                                </p>
                                            </div>
                                            <Badge className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-700 ring-1 ring-emerald-200">
                                                {item.status.label}
                                            </Badge>
                                        </div>
                                        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-3 text-sm">
                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Harga
                                                </p>
                                                <p className="mt-1 font-medium text-slate-900 tabular-nums">
                                                    {formatRupiah(item.price)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Qty
                                                </p>
                                                <p className="mt-1 font-medium text-slate-900 tabular-nums">
                                                    {item.quantity}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Subtotal
                                                </p>
                                                <p className="mt-1 font-bold text-slate-900 tabular-nums">
                                                    {formatRupiah(
                                                        item.subtotal,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="hidden overflow-x-auto md:block">
                                <Table className="min-w-[760px]">
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            {[
                                                'Produk',
                                                'Seller',
                                                'Harga',
                                                'Qty',
                                                'Subtotal',
                                                'Status',
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
                                        {order.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="px-5 font-bold text-slate-900">
                                                    <div>
                                                        <p>
                                                            {item.product_name}
                                                        </p>
                                                        {item.is_pre_order && (
                                                            <p className="mt-1 text-xs font-medium text-[#0080FF]">
                                                                PO{' '}
                                                                {
                                                                    item.pre_order_estimate_days
                                                                }{' '}
                                                                hari
                                                                {item.pre_order_deadline &&
                                                                    ` • Deadline ${formatDateID(item.pre_order_deadline)}`}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-5">
                                                    <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                                                        <Store className="size-3.5" />
                                                        {item.seller.name}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-5">
                                                    {formatRupiah(item.price)}
                                                </TableCell>
                                                <TableCell className="px-5">
                                                    {item.quantity}
                                                </TableCell>
                                                <TableCell className="px-5 font-bold text-slate-900 tabular-nums">
                                                    {formatRupiah(
                                                        item.subtotal,
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-5">
                                                    <Badge
                                                        className={
                                                            item.status.code ===
                                                            'cancelled'
                                                                ? 'rounded-[6px] bg-[#FEF2F2] text-[#DC2626] ring-1 ring-red-200'
                                                                : 'rounded-[6px] bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                                        }
                                                    >
                                                        {item.status.label}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {order.cancelled_at && (
                                <div className="border-t border-slate-100 p-6">
                                    <div className="flex items-start gap-3 rounded-[14px] border border-red-200 bg-[#FEF2F2] p-4">
                                        <XCircle className="mt-0.5 size-5 text-[#DC2626]" />
                                        <div>
                                            <p className="font-semibold text-[#7f1d1d]">
                                                Pesanan Dibatalkan
                                            </p>
                                            <p className="mt-1 text-sm text-[#DC2626]">
                                                Dibatalkan pada{' '}
                                                {formatDate(order.cancelled_at)}
                                                {order.cancel_reason && (
                                                    <span className="mt-1 block">
                                                        <strong className="text-[#7f1d1d]">
                                                            Alasan:
                                                        </strong>{' '}
                                                        {order.cancel_reason}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
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

BuyerOrdersShow.layout = {
    breadcrumbs: [{ title: 'Orders', href: ordersIndex() }],
};

const paymentStatusClass: Record<string, string> = {
    unpaid: 'mt-2 rounded-[6px] bg-slate-100 text-slate-700 ring-1 ring-slate-200',
    pending_confirmation: 'mt-2 rounded-[6px] bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    paid: 'mt-2 rounded-[6px] bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    rejected: 'mt-2 rounded-[6px] bg-[#FEF2F2] text-[#DC2626] ring-1 ring-red-200',
};
