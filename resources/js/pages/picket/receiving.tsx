import { Form, Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Inbox, Loader2, PackageCheck, ShoppingCart, Store } from 'lucide-react';
import { EmptyState } from '@/components/admin-jurusan/empty-state';
import { PageHeader } from '@/components/admin-jurusan/page-header';
import { FlashAlert } from '@/components/picket/flash-alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type Consignment = {
    id: number;
    seller_name: string;
    product_name: string;
    requested_quantity: number;
    received_quantity: number;
    status: { code: string; label: string };
};

type Props = {
    up_jurusan: { id: number; name: string } | null;
    consignments: Consignment[];
};

export default function PicketReceiving({ up_jurusan, consignments }: Props) {
    const { flash } = usePage().props as unknown as {
        flash: { success?: string; error?: string };
    };
    const awaitingReceive = consignments.filter(
        (consignment) =>
            consignment.status.code === 'approved' &&
            consignment.received_quantity < consignment.requested_quantity,
    );
    const history = consignments.filter(
        (c) => c.received_quantity > 0 || c.status.code !== 'approved',
    ).slice(0, 6);

    return (
        <>
            <Head title="Terima Barang Titipan" />
            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    badge={up_jurusan?.name ?? 'UP Jurusan'}
                    badgeIcon={Store}
                    title="Terima Barang Titipan"
                    description="Catat barang fisik yang sudah datang setelah request disetujui admin jurusan. Cek jumlah, lalu simpan agar stok masuk POS."
                    actions={
                        <>
                            <Button asChild variant="outline" className="rounded-xl">
                                <Link href="/picket/dashboard">
                                    <ArrowLeft className="size-4" />
                                    Dashboard
                                </Link>
                            </Button>
                            <Button asChild className="rounded-xl">
                                <Link href="/picket/pos">
                                    <ShoppingCart className="size-4" />
                                    Buka POS
                                </Link>
                            </Button>
                        </>
                    }
                />

                <FlashAlert success={flash.success} error={flash.error} />

                <Card className="rounded-xl border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-col gap-4 p-5 pb-0 sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:pb-0">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <span className="grid size-9 place-items-center rounded-xl bg-[#EFF8FF] text-[#0080FF]">
                                    <PackageCheck className="size-5" />
                                </span>
                                Barang Menunggu Diterima
                            </CardTitle>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                {awaitingReceive.length} request siap dicatat • Hanya yang approved dan belum penuh yang tampil
                            </p>
                        </div>
                        <Badge variant="secondary" className="w-fit rounded-full bg-[#EFF8FF] px-3 py-1.5 text-[#0080FF] ring-1 ring-blue-200">
                            {awaitingReceive.length} antrian
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-5 sm:p-6">
                        {awaitingReceive.length === 0 ? (
                            <EmptyState
                                icon={Inbox}
                                title="Tidak ada yang menunggu"
                                description="Semua barang approved sudah diterima penuh. Saat ada request baru yang di-approve, akan muncul di sini untuk dicatat penerimaan fisiknya."
                                actionHref="/picket/pos"
                                actionLabel="Buka POS"
                            />
                        ) : (
                            <div className="grid gap-4">
                                {awaitingReceive.map((consignment) => {
                                    const remaining = consignment.requested_quantity - consignment.received_quantity;
                                    const progressPct = Math.round((consignment.received_quantity / consignment.requested_quantity) * 100);

                                    return (
                                        <Form
                                            key={consignment.id}
                                            action={`/picket/up-jurusan/consignments/${consignment.id}/receive`}
                                            method="post"
                                            disableWhileProcessing
                                            className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-[#BCE0FF] hover:shadow-md sm:p-5"
                                        >
                                            {({ processing, errors }) => (
                                                <>
                                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-semibold leading-6 text-slate-900">{consignment.product_name}</p>
                                                            <p className="mt-1 truncate text-sm text-slate-500">
                                                                {consignment.seller_name} • diterima{' '}
                                                                <span className="font-semibold tabular-nums text-slate-700">
                                                                    {consignment.received_quantity}
                                                                </span>
                                                                /{consignment.requested_quantity} item
                                                            </p>
                                                            <div className="mt-3 h-2 w-full max-w-[260px] overflow-hidden rounded-full bg-slate-100">
                                                                <div
                                                                    className="h-full rounded-full bg-[#0080FF] transition-all duration-500"
                                                                    style={{ width: `${progressPct}%` }}
                                                                />
                                                            </div>
                                                            <p className="mt-1 text-xs text-slate-500">{progressPct}% diterima • Sisa {remaining} item</p>
                                                        </div>
                                                        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end lg:w-auto">
                                                            <label className="flex-1 space-y-1.5 lg:w-44">
                                                                <span className="text-xs font-medium text-slate-600">Jumlah diterima</span>
                                                                <Input
                                                                    name="quantity"
                                                                    type="number"
                                                                    inputMode="numeric"
                                                                    min={1}
                                                                    max={remaining}
                                                                    defaultValue={remaining}
                                                                    required
                                                                    aria-label={`Jumlah terima ${consignment.product_name}`}
                                                                    className="h-11 rounded-xl border-slate-200 bg-white"
                                                                    aria-invalid={Boolean(errors.quantity)}
                                                                />
                                                                {errors.quantity && (
                                                                    <p className="text-xs text-rose-600">{errors.quantity}</p>
                                                                )}
                                                            </label>
                                                            <Button
                                                                type="submit"
                                                                disabled={processing}
                                                                className="h-11 shrink-0 rounded-xl px-6 font-semibold"
                                                            >
                                                                {processing ? <Loader2 className="size-4 animate-spin" /> : <PackageCheck className="size-4" />}
                                                                {processing ? 'Menyimpan...' : 'Terima Barang'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <p className="mt-3 text-xs leading-5 text-slate-500">
                                                        Pastikan jumlah fisik sesuai sebelum simpan. Setelah diterima, stok otomatis tersedia di POS.
                                                    </p>
                                                </>
                                            )}
                                        </Form>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {history.length > 0 && (
                    <Card className="rounded-xl border-slate-200 shadow-sm">
                        <CardHeader className="p-5 pb-0 sm:p-6 sm:pb-0">
                            <CardTitle className="text-base">Riwayat Penerimaan</CardTitle>
                            <p className="text-sm leading-6 text-slate-500">6 data terbaru untuk konteks — bukan daftar lengkap.</p>
                        </CardHeader>
                        <CardContent className="p-5 sm:p-6">
                            <div className="grid gap-3 sm:grid-cols-2">
                                {history.map((item) => (
                                    <div key={`h-${item.id}`} className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                                        <p className="truncate text-sm font-semibold text-slate-900">{item.product_name}</p>
                                        <p className="mt-1 truncate text-xs text-slate-500">{item.seller_name}</p>
                                        <div className="mt-2 flex items-center justify-between gap-2">
                                            <span className="text-xs tabular-nums text-slate-600">
                                                {item.received_quantity}/{item.requested_quantity} item
                                            </span>
                                            <Badge className="rounded-full bg-white px-2 py-0 text-xs ring-1 ring-slate-200">{item.status.label}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

PicketReceiving.layout = {
    breadcrumbs: [{ title: 'Terima Barang', href: '/picket/receiving' }],
};
