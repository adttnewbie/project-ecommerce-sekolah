import { Form, Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    Check,
    Clock,
    Info,
    Loader2,
    Package,
    ShoppingBag,
    Store,
    Wallet,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { StatusBadge } from '@/components/admin-jurusan/status-badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Props = {
    consignment: {
        id: number;
        seller: { id: number; name: string; email: string };
        product: {
            id: number;
            name: string;
            description: string;
            price: number;
            stock: number;
        };
        up_jurusan: { id: number; name: string };
        requested_quantity: number;
        received_quantity: number;
        sold_quantity: number;
        commission_rate: number | null;
        seller_earnings: number;
        paid_amount: number;
        unpaid_amount: number;
        status: { code: string; label: string };
        created_at: string | null;
    };
};

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

const steps = [
    { code: 'pending_approval', label: 'Menunggu' },
    { code: 'approved', label: 'Disetujui' },
    { code: 'received', label: 'Diterima' },
    { code: 'completed', label: 'Selesai' },
] as const;

function stepperIndex(code: string) {
    const idx = steps.findIndex((s) => s.code === code);

    if (idx !== -1) {
return idx;
}

    if (code === 'rejected' || code === 'cancelled') {
return 0;
}

    return 0;
}

export default function AdminJurusanConsignmentShow({ consignment }: Props) {
    const { flash } = usePage().props as unknown as {
        flash: { success?: string; error?: string };
    };
    const payoutForm = useForm({ amount: '', note: '' });
    const [commission, setCommission] = useState<number>(
        consignment.commission_rate ?? 10,
    );

    const submitPayout = (e: FormEvent) => {
        e.preventDefault();
        payoutForm.post(`/admin-jurusan/consignments/${consignment.id}/payout`);
    };

    const estimatedSellerPerItem = useMemo(() => {
        if (commission === null) {
return consignment.product.price;
}

        return Math.round(consignment.product.price * (1 - commission / 100));
    }, [commission, consignment.product.price]);

    const unpaidPercent = consignment.seller_earnings
        ? Math.round(
              (consignment.unpaid_amount / consignment.seller_earnings) * 100,
          )
        : 0;

    const availableStock = Math.max(
        0,
        consignment.received_quantity - consignment.sold_quantity,
    );

    return (
        <>
            <Head title={`Request ${consignment.product.name}`} />
            <div className="space-y-6 p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-900">
                                {consignment.product.name}
                            </h1>
                            <StatusBadge
                                code={consignment.status.code}
                                label={consignment.status.label}
                            />
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            Request #{consignment.id} •{' '}
                            {consignment.seller.name} •{' '}
                            {consignment.up_jurusan.name}
                        </p>
                    </div>
                    <Button
                        asChild
                        variant="outline"
                        className="shrink-0 rounded-lg"
                    >
                        <Link href="/admin-jurusan/consignments">
                            <ArrowLeft className="size-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                {(flash.success || flash.error) && (
                    <Alert
                        variant={flash.error ? 'destructive' : 'default'}
                        className={
                            flash.error
                                ? 'border-rose-200 bg-rose-50 text-rose-700'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        }
                    >
                        <AlertTitle>
                            {flash.error ? 'Gagal' : 'Berhasil'}
                        </AlertTitle>
                        <AlertDescription>
                            {flash.error || flash.success}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Stepper */}
                <Card className="rounded-xl border-slate-200 shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 text-sm">
                            {steps.map((s, i) => {
                                const active =
                                    stepperIndex(consignment.status.code) >= i;
                                const isCurrent =
                                    stepperIndex(consignment.status.code) === i;

                                return (
                                    <div
                                        key={s.code}
                                        className="flex flex-1 items-center gap-2"
                                    >
                                        <div className="flex flex-col items-center gap-1">
                                            <span
                                                className={`grid size-8 place-items-center rounded-full border text-xs font-semibold transition ${
                                                    active
                                                        ? 'border-blue-600 bg-blue-600 text-white'
                                                        : 'border-slate-200 bg-slate-50 text-slate-400'
                                                } ${isCurrent ? 'ring-2 ring-blue-200' : ''}`}
                                            >
                                                {active ? (
                                                    <Check className="size-4" />
                                                ) : (
                                                    i + 1
                                                )}
                                            </span>
                                            <span
                                                className={`text-xs font-medium ${active ? 'text-blue-700' : 'text-slate-400'}`}
                                            >
                                                {s.label}
                                            </span>
                                        </div>
                                        {i < steps.length - 1 && (
                                            <div
                                                className={`h-0.5 flex-1 rounded-full ${active ? 'bg-blue-600' : 'bg-slate-200'}`}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {(consignment.status.code === 'rejected' ||
                            consignment.status.code === 'cancelled') && (
                            <Alert
                                variant="destructive"
                                className="mt-4 border-rose-200 bg-rose-50 text-rose-700"
                            >
                                <AlertTitle>
                                    Status: {consignment.status.label}
                                </AlertTitle>
                                <AlertDescription>
                                    Request dihentikan dan tidak akan masuk stok
                                    UP.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    {/* Product */}
                    <Card className="rounded-xl border-slate-200 shadow-sm">
                        <CardHeader className="border-b border-slate-100">
                            <CardTitle className="flex items-center gap-2">
                                <Package className="size-5 text-blue-600" />
                                Produk Seller
                            </CardTitle>
                            <CardDescription>
                                Detail produk yang diajukan untuk titip
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 p-5">
                            <div className="flex gap-4">
                                <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-400">
                                    <ShoppingBag className="size-7" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold text-slate-900">
                                        {consignment.product.name}
                                    </p>
                                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                                        {consignment.product.description ||
                                            'Tidak ada deskripsi'}
                                    </p>
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                    <p className="text-xs font-medium text-slate-500">
                                        Harga jual
                                    </p>
                                    <p className="mt-1 font-semibold text-slate-900 tabular-nums">
                                        {formatRupiah(
                                            consignment.product.price,
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                    <p className="text-xs font-medium text-slate-500">
                                        Stok produk
                                    </p>
                                    <p className="mt-1 font-semibold text-slate-900 tabular-nums">
                                        {consignment.product.stock} item
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                    <p className="text-xs font-medium text-slate-500">
                                        Qty request
                                    </p>
                                    <p className="mt-1 font-semibold text-slate-900 tabular-nums">
                                        {consignment.requested_quantity} item
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Diterima {consignment.received_quantity}{' '}
                                        • Sisa {availableStock}
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm leading-6 text-blue-800">
                                <p className="flex items-center gap-2 font-medium">
                                    <Info className="size-4" />
                                    Catatan operasional
                                </p>
                                <p className="mt-1 text-blue-700">
                                    Setelah approve, picket officer menerima
                                    barang fisik via Receiving. Komisi berlaku
                                    untuk semua penjualan titipan ini.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Request & actions */}
                    <div className="space-y-6">
                        <Card className="rounded-xl border-slate-200 shadow-sm">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle className="flex items-center gap-2">
                                    <Store className="size-5 text-slate-600" />
                                    Ringkasan Request
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 p-5">
                                <div className="grid gap-4 text-sm">
                                    <Field
                                        label="Seller"
                                        value={`${consignment.seller.name} · ${consignment.seller.email}`}
                                    />
                                    <Field
                                        label="UP Tujuan"
                                        value={consignment.up_jurusan.name}
                                    />
                                    <div className="grid grid-cols-3 gap-3">
                                        <Mini
                                            label="Diminta"
                                            value={`${consignment.requested_quantity}`}
                                        />
                                        <Mini
                                            label="Diterima"
                                            value={`${consignment.received_quantity}`}
                                            tone={
                                                consignment.received_quantity >
                                                0
                                                    ? 'emerald'
                                                    : 'slate'
                                            }
                                        />
                                        <Mini
                                            label="Terjual"
                                            value={`${consignment.sold_quantity}`}
                                        />
                                    </div>
                                    <Field
                                        label="Komisi UP"
                                        value={
                                            consignment.commission_rate === null
                                                ? 'Belum ditetapkan'
                                                : `${consignment.commission_rate}% · Seller terima ${formatRupiah(estimatedSellerPerItem)}/item`
                                        }
                                    />
                                    <div className="space-y-2">
                                        <Field
                                            label="Hak seller (estimasi)"
                                            value={formatRupiah(
                                                consignment.seller_earnings,
                                            )}
                                        />
                                        <div className="flex gap-2 text-xs">
                                            <Badge
                                                variant="secondary"
                                                className="rounded-md bg-emerald-50 text-emerald-700"
                                            >
                                                Sudah cair{' '}
                                                {formatRupiah(
                                                    consignment.paid_amount,
                                                )}
                                            </Badge>
                                            <Badge
                                                variant="secondary"
                                                className="rounded-md bg-amber-50 text-amber-700"
                                            >
                                                Sisa{' '}
                                                {formatRupiah(
                                                    consignment.unpaid_amount,
                                                )}{' '}
                                                ({unpaidPercent}%)
                                            </Badge>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full rounded-full bg-emerald-500 transition-all"
                                                style={{
                                                    width: `${Math.min(100, Math.round((consignment.paid_amount / Math.max(1, consignment.seller_earnings)) * 100))}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <Field
                                        label="Tanggal request"
                                        value={
                                            consignment.created_at
                                                ? new Date(
                                                      consignment.created_at,
                                                  ).toLocaleString('id-ID', {
                                                      dateStyle: 'medium',
                                                      timeStyle: 'short',
                                                  })
                                                : '-'
                                        }
                                    />
                                </div>

                                {consignment.status.code ===
                                    'pending_approval' && (
                                    <div className="space-y-4 border-t border-slate-100 pt-4">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">
                                                Putuskan request
                                            </p>
                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                Tentukan komisi sebelum approve.
                                                Komisi 10% adalah standar; 0%
                                                untuk promo, &gt;15% untuk
                                                kategori premium.
                                            </p>
                                        </div>
                                        <Form
                                            action={`/admin-jurusan/consignments/${consignment.id}/approve`}
                                            method="post"
                                            disableWhileProcessing
                                            className="space-y-3"
                                        >
                                            {({ processing, errors }) => (
                                                <>
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="commission_rate"
                                                            className="text-xs font-medium text-slate-700"
                                                        >
                                                            Komisi UP (%)
                                                        </Label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {[
                                                                0, 5, 10, 15,
                                                                20,
                                                            ].map((v) => (
                                                                <button
                                                                    key={v}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setCommission(
                                                                            v,
                                                                        )
                                                                    }
                                                                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${commission === v ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                                                                >
                                                                    {v}%
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                id="commission_rate"
                                                                name="commission_rate"
                                                                type="number"
                                                                min={0}
                                                                max={100}
                                                                value={
                                                                    commission
                                                                }
                                                                onChange={(e) =>
                                                                    setCommission(
                                                                        Number(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    )
                                                                }
                                                                required
                                                                className="w-28 rounded-lg"
                                                                aria-invalid={Boolean(
                                                                    errors.commission_rate,
                                                                )}
                                                            />
                                                            <span className="text-xs text-slate-500">
                                                                Seller terima{' '}
                                                                {formatRupiah(
                                                                    estimatedSellerPerItem,
                                                                )}
                                                                /item
                                                            </span>
                                                        </div>
                                                        {errors.commission_rate && (
                                                            <p className="text-xs text-rose-600">
                                                                {
                                                                    errors.commission_rate
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Button
                                                        type="submit"
                                                        disabled={processing}
                                                        className="w-full rounded-lg"
                                                    >
                                                        {processing ? (
                                                            <Loader2 className="size-4 animate-spin" />
                                                        ) : (
                                                            <Check className="size-4" />
                                                        )}
                                                        {processing
                                                            ? 'Memproses...'
                                                            : `Approve dengan ${commission}%`}
                                                    </Button>
                                                </>
                                            )}
                                        </Form>
                                        <RejectConsignmentDialog
                                            consignment={consignment}
                                        />
                                    </div>
                                )}

                                {(consignment.status.code === 'approved' ||
                                    consignment.status.code === 'received') && (
                                    <Alert className="border-blue-200 bg-blue-50 text-blue-800">
                                        <Clock className="size-4" />
                                        <AlertTitle>
                                            Menunggu penerimaan picket
                                        </AlertTitle>
                                        <AlertDescription className="text-blue-700">
                                            Barang fisik diterima oleh picket
                                            officer lewat halaman Receiving.
                                            Kamu tinggal pantau stok & payout.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-slate-200 shadow-sm">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle className="flex items-center gap-2">
                                    <Wallet className="size-5 text-emerald-600" />
                                    Pencairan Seller
                                </CardTitle>
                                <CardDescription>
                                    Sisa yang bisa dicairkan:{' '}
                                    <span className="font-semibold text-slate-900">
                                        {formatRupiah(
                                            consignment.unpaid_amount,
                                        )}
                                    </span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-5">
                                {consignment.unpaid_amount <= 0 ? (
                                    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                                        <div className="mx-auto grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                                            <Banknote className="size-5" />
                                        </div>
                                        <p className="mt-3 text-sm font-medium text-slate-900">
                                            Tidak ada saldo untuk dicairkan
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Penjualan belum menghasilkan hak
                                            seller atau sudah lunas dibayar.
                                        </p>
                                    </div>
                                ) : (
                                    <form
                                        onSubmit={submitPayout}
                                        className="space-y-3"
                                    >
                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor="payout_amount"
                                                className="text-xs font-medium text-slate-700"
                                            >
                                                Nominal pencairan
                                            </Label>
                                            <div className="relative">
                                                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400">
                                                    Rp
                                                </span>
                                                <Input
                                                    id="payout_amount"
                                                    name="amount"
                                                    type="number"
                                                    min="1"
                                                    max={
                                                        consignment.unpaid_amount
                                                    }
                                                    placeholder="0"
                                                    required
                                                    value={
                                                        payoutForm.data.amount
                                                    }
                                                    onChange={(e) =>
                                                        payoutForm.setData(
                                                            'amount',
                                                            e.target.value,
                                                        )
                                                    }
                                                    disabled={
                                                        payoutForm.processing
                                                    }
                                                    className="rounded-lg pl-9 tabular-nums"
                                                    aria-invalid={Boolean(
                                                        payoutForm.errors
                                                            .amount,
                                                    )}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-rose-600">
                                                    {payoutForm.errors.amount}
                                                </p>
                                                <span className="text-xs text-slate-500">
                                                    Max{' '}
                                                    {formatRupiah(
                                                        consignment.unpaid_amount,
                                                    )}
                                                </span>
                                            </div>
                                            {payoutForm.data.amount &&
                                                Number(payoutForm.data.amount) >
                                                    0 && (
                                                    <p className="text-xs text-slate-600">
                                                        Preview:{' '}
                                                        {formatRupiah(
                                                            Number(
                                                                payoutForm.data
                                                                    .amount,
                                                            ),
                                                        )}{' '}
                                                        akan dicatat sebagai
                                                        pencairan. Sisa setelah
                                                        ini{' '}
                                                        <span className="font-medium">
                                                            {formatRupiah(
                                                                Math.max(
                                                                    0,
                                                                    consignment.unpaid_amount -
                                                                        Number(
                                                                            payoutForm
                                                                                .data
                                                                                .amount,
                                                                        ),
                                                                ),
                                                            )}
                                                        </span>
                                                    </p>
                                                )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor="payout_note"
                                                className="text-xs font-medium text-slate-700"
                                            >
                                                Catatan (opsional)
                                            </Label>
                                            <Input
                                                id="payout_note"
                                                name="note"
                                                placeholder="Contoh: Transfer BCA 14 Nov, tunai di UP"
                                                value={payoutForm.data.note}
                                                onChange={(e) =>
                                                    payoutForm.setData(
                                                        'note',
                                                        e.target.value,
                                                    )
                                                }
                                                disabled={payoutForm.processing}
                                                className="rounded-lg"
                                            />
                                            {payoutForm.errors.note && (
                                                <p className="text-xs text-rose-600">
                                                    {payoutForm.errors.note}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            type="submit"
                                            variant="outline"
                                            disabled={payoutForm.processing}
                                            className="w-full rounded-lg"
                                        >
                                            {payoutForm.processing && (
                                                <Loader2 className="size-4 animate-spin" />
                                            )}
                                            {payoutForm.processing
                                                ? 'Memproses...'
                                                : 'Catat pencairan'}
                                        </Button>
                                    </form>
                                )}
                                <div className="mt-4 flex gap-2 text-xs">
                                    <Badge
                                        variant="outline"
                                        className="rounded-md"
                                    >
                                        Total hak{' '}
                                        {formatRupiah(
                                            consignment.seller_earnings,
                                        )}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="rounded-md"
                                    >
                                        Terbayar{' '}
                                        {formatRupiah(consignment.paid_amount)}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

function RejectConsignmentDialog({
    consignment,
}: {
    consignment: Props['consignment'];
}) {
    const [reason, setReason] = useState('');

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-lg"
                >
                    Tolak request
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-xl bg-white">
                <AlertDialogHeader>
                    <AlertDialogTitle>Tolak request titip?</AlertDialogTitle>
                    <AlertDialogDescription>
                        <span className="font-medium text-slate-900">
                            {consignment.product.name}
                        </span>{' '}
                        dari {consignment.seller.name} akan ditolak. Alasan akan
                        terlihat oleh seller.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <Form
                    action={`/admin-jurusan/consignments/${consignment.id}/reject`}
                    method="post"
                    disableWhileProcessing
                    className="space-y-4"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="space-y-2">
                                <Textarea
                                    name="rejection_reason"
                                    required
                                    maxLength={1000}
                                    placeholder="Tulis alasan penolakan yang jelas dan membantu seller memperbaiki..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    aria-invalid={Boolean(
                                        errors.rejection_reason,
                                    )}
                                    className="min-h-28 rounded-lg"
                                />
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-rose-600">
                                        {errors.rejection_reason}
                                    </p>
                                    <span
                                        className={`text-xs tabular-nums ${reason.length > 900 ? 'text-amber-600' : 'text-slate-400'}`}
                                    >
                                        {reason.length}/1000
                                    </span>
                                </div>
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-lg"
                                        disabled={processing}
                                    >
                                        Batal
                                    </Button>
                                </AlertDialogCancel>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    className="rounded-lg"
                                    disabled={processing || !reason.trim()}
                                >
                                    {processing ? 'Memproses...' : 'Reject'}
                                </Button>
                            </AlertDialogFooter>
                        </>
                    )}
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    );
}

AdminJurusanConsignmentShow.layout = {
    breadcrumbs: [
        { title: 'Titipan', href: '/admin-jurusan/consignments' },
        { title: 'Detail', href: '#' },
    ],
};

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                {label}
            </p>
            <p className="text-sm leading-6 text-slate-900">{value}</p>
        </div>
    );
}

function Mini({
    label,
    value,
    tone = 'slate',
}: {
    label: string;
    value: string;
    tone?: 'slate' | 'emerald' | 'amber';
}) {
    return (
        <div
            className={`rounded-xl border p-3 text-center ${tone === 'emerald' ? 'border-emerald-100 bg-emerald-50' : tone === 'amber' ? 'border-amber-100 bg-amber-50' : 'border-slate-100 bg-slate-50'}`}
        >
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 tabular-nums">
                {value}
            </p>
        </div>
    );
}
