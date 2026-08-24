import { Form, Head, Link } from '@inertiajs/react';
import { CheckCircle2, FileText, Loader2, ReceiptText, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/admin-jurusan/empty-state';
import { PageHeader } from '@/components/admin-jurusan/page-header';
import { StatCard } from '@/components/admin-jurusan/stat-card';
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

type DailyReportItem = {
    id: number;
    code: string;
    receipt_url: string;
    sold_at: string | null;
    total_quantity: number;
    total_amount: number;
    commission_amount: number;
    seller_amount: number;
    products: {
        product_name: string;
        source: string;
        quantity: number;
        unit_price: number;
        subtotal: number;
    }[];
};

type Props = {
    errors?: {
        report?: string;
    };
    daily_report: {
        date: string;
        total_sold: number;
        total_revenue: number;
        submitted_at: string | null;
        items: DailyReportItem[];
    };
};

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

const formatDateTime = (value: string | null) =>
    value ? new Date(value).toLocaleString('id-ID') : '-';

export default function PicketReports({ errors, daily_report }: Props) {
    const [q, setQ] = useState('');
    const filtered = useMemo(() => {
        const kw = q.trim().toLowerCase();

        if (!kw) {
return daily_report.items;
}

        return daily_report.items.filter(
            (it) =>
                it.code.toLowerCase().includes(kw) ||
                it.products.some((p) => p.product_name.toLowerCase().includes(kw)),
        );
    }, [daily_report.items, q]);

    const isSubmitted = Boolean(daily_report.submitted_at);

    return (
        <>
            <Head title="Reports Picket" />
            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    badge={daily_report.date}
                    badgeIcon={FileText}
                    title="Laporan Penjualan"
                    description="Daftar transaksi POS hari ini. Setelah laporan dikirim, POS hari ini otomatis ditutup dan tidak bisa tambah transaksi baru."
                    actions={
                        isSubmitted ? (
                            <Badge className="rounded-full bg-emerald-50 px-4 py-2 text-emerald-700 ring-1 ring-emerald-200">
                                <CheckCircle2 className="size-4" />
                                Laporan dikirim
                            </Badge>
                        ) : daily_report.items.length === 0 ? (
                            <Button type="button" disabled className="h-11 rounded-xl opacity-60">
                                <ReceiptText className="size-4" />
                                Belum ada transaksi
                            </Button>
                        ) : (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="h-11 rounded-xl font-semibold">
                                        <ReceiptText className="size-4" />
                                        Buat laporan
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl bg-white">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Kirim laporan harian?</AlertDialogTitle>
                                        <AlertDialogDescription className="leading-6">
                                            Laporan untuk <span className="font-semibold text-slate-900">{daily_report.date}</span> akan dikunci.
                                            Total <span className="font-semibold">{daily_report.items.length} transaksi • {formatRupiah(daily_report.total_revenue)}</span> akan
                                            disnapshot. Setelah dikirim, POS hari ini tidak bisa mencatat penjualan baru.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <Form action="/picket/up-jurusan/report" method="post" disableWhileProcessing>
                                        {({ processing }) => (
                                            <AlertDialogFooter className="gap-2 sm:gap-3">
                                                <AlertDialogCancel asChild>
                                                    <Button type="button" variant="outline" className="rounded-xl" disabled={processing}>
                                                        Batal
                                                    </Button>
                                                </AlertDialogCancel>
                                                <Button type="submit" disabled={processing} className="rounded-xl">
                                                    {processing ? <Loader2 className="size-4 animate-spin" /> : <ReceiptText className="size-4" />}
                                                    {processing ? 'Mengirim...' : 'Ya, kirim laporan'}
                                                </Button>
                                            </AlertDialogFooter>
                                        )}
                                    </Form>
                                </AlertDialogContent>
                            </AlertDialog>
                        )
                    }
                />

                {errors?.report && (
                    <Alert variant="destructive" className="rounded-xl">
                        <AlertTitle>Gagal membuat laporan</AlertTitle>
                        <AlertDescription>{errors.report}</AlertDescription>
                    </Alert>
                )}
                {isSubmitted && (
                    <Alert className="rounded-xl border-emerald-200 bg-emerald-50 text-emerald-800">
                        <CheckCircle2 className="size-4" />
                        <AlertTitle className="text-emerald-900">Laporan sudah dikunci</AlertTitle>
                        <AlertDescription className="text-emerald-700">
                            Dikirim {formatDateTime(daily_report.submitted_at)} • {daily_report.items.length} transaksi • Omzet {formatRupiah(daily_report.total_revenue)}
                        </AlertDescription>
                    </Alert>
                )}

                <section className="grid gap-4 sm:grid-cols-2">
                    <StatCard label="Total item terjual" value={daily_report.total_sold} hint="Quantity keluar POS" icon={FileText} tone="blue" />
                    <StatCard
                        label="Total omzet"
                        value={formatRupiah(daily_report.total_revenue)}
                        hint="Gross sebelum split komisi"
                        icon={ReceiptText}
                        tone="emerald"
                    />
                </section>

                <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
                    <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-semibold tracking-tight text-slate-900">Transaksi laporan</h2>
                            <p className="text-sm leading-6 text-slate-500">
                                {filtered.length} dari {daily_report.items.length} transaksi
                                {q && <> untuk “{q}”</>}
                            </p>
                        </div>
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Cari kode nota atau produk..."
                                className="h-11 rounded-xl border-slate-200 bg-white pl-9"
                                aria-label="Cari transaksi laporan"
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
                    </CardContent>
                    <CardContent className="p-0">
                        {daily_report.items.length === 0 ? (
                            <EmptyState
                                icon={ReceiptText}
                                title="Belum ada data untuk dilaporkan"
                                description="Catat penjualan di POS dulu. Setelah ada transaksi, tombol Buat laporan akan aktif dan data muncul di sini."
                                actionHref="/picket/pos"
                                actionLabel="Buka POS"
                            />
                        ) : filtered.length === 0 ? (
                            <EmptyState
                                icon={Search}
                                title="Tidak ada hasil"
                                description={`Tidak ada transaksi dengan kata kunci "${q}".`}
                            />
                        ) : (
                            <>
                                {/* Desktop */}
                                <div className="hidden md:block">
                                    <Table className="[&_tbody_tr:nth-child(even)]:bg-slate-50/70">
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Transaksi</TableHead>
                                                <TableHead>Produk</TableHead>
                                                <TableHead className="text-right">Item</TableHead>
                                                <TableHead className="text-right">Omzet</TableHead>
                                                <TableHead className="text-right">Komisi UP</TableHead>
                                                <TableHead className="text-right">Hak Seller</TableHead>
                                                <TableHead className="text-right">Nota</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filtered.map((item) => (
                                                <TableRow key={item.code} className="hover:bg-[#EFF8FF]/50">
                                                    <TableCell className="min-w-52 whitespace-normal">
                                                        <p className="font-bold text-slate-900">{item.code}</p>
                                                        <p className="text-xs text-slate-500">{formatDateTime(item.sold_at)}</p>
                                                    </TableCell>
                                                    <TableCell className="min-w-72">
                                                        <div className="space-y-2">
                                                            {item.products.map((product) => (
                                                                <div
                                                                    key={`${item.code}-${product.product_name}-${product.source}`}
                                                                    className="rounded-xl border border-slate-200 bg-white p-2.5"
                                                                >
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <p className="text-sm font-semibold text-slate-900">{product.product_name}</p>
                                                                        <Badge
                                                                            className={`rounded-full px-2 py-0 text-xs ring-1 ${product.source === 'Produk UP' ? 'bg-[#EFF8FF] text-[#0080FF] ring-blue-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200'}`}
                                                                        >
                                                                            {product.source}
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="mt-1 text-xs tabular-nums text-slate-500">
                                                                        {product.quantity} x {formatRupiah(product.unit_price)} = {formatRupiah(product.subtotal)}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums text-sm">{item.total_quantity} item</TableCell>
                                                    <TableCell className="text-right font-bold tabular-nums text-slate-900">{formatRupiah(item.total_amount)}</TableCell>
                                                    <TableCell className="text-right font-semibold tabular-nums text-[#0080FF]">{formatRupiah(item.commission_amount)}</TableCell>
                                                    <TableCell className="text-right font-semibold tabular-nums text-emerald-700">{formatRupiah(item.seller_amount)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button asChild size="sm" variant="outline" className="h-9 rounded-full">
                                                            <Link href={item.receipt_url}>
                                                                <ReceiptText className="size-4" />
                                                                Detail
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile */}
                                <div className="divide-y divide-slate-100 md:hidden">
                                    {filtered.map((item) => (
                                        <div key={item.code} className="space-y-3 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-bold text-slate-900">{item.code}</p>
                                                    <p className="text-xs text-slate-500">{formatDateTime(item.sold_at)}</p>
                                                </div>
                                                <Badge variant="secondary" className="rounded-full bg-slate-100 px-2.5 py-1 text-xs">
                                                    {item.total_quantity} item
                                                </Badge>
                                            </div>
                                            <div className="space-y-2">
                                                {item.products.map((p) => (
                                                    <div key={p.product_name + p.source} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                                                        <div className="flex items-center gap-2">
                                                            <p className="truncate text-sm font-semibold text-slate-900">{p.product_name}</p>
                                                            <Badge className={`shrink-0 rounded-full px-2 py-0 text-xs ring-1 ${p.source === 'Produk UP' ? 'bg-[#EFF8FF] text-[#0080FF]' : 'bg-emerald-50 text-emerald-700'}`}>
                                                                {p.source}
                                                            </Badge>
                                                        </div>
                                                        <p className="mt-1 text-xs tabular-nums text-slate-500">
                                                            {p.quantity} x {formatRupiah(p.unit_price)} = {formatRupiah(p.subtotal)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center">
                                                <div>
                                                    <p className="text-xs text-slate-500">Omzet</p>
                                                    <p className="mt-1 text-sm font-bold tabular-nums">{formatRupiah(item.total_amount)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Komisi UP</p>
                                                    <p className="mt-1 text-sm font-bold tabular-nums text-[#0080FF]">{formatRupiah(item.commission_amount)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Seller</p>
                                                    <p className="mt-1 text-sm font-bold tabular-nums text-emerald-700">{formatRupiah(item.seller_amount)}</p>
                                                </div>
                                            </div>
                                            <Button asChild variant="outline" className="h-11 w-full rounded-xl">
                                                <Link href={item.receipt_url}>
                                                    <ReceiptText className="size-4" />
                                                    Lihat Nota
                                                </Link>
                                            </Button>
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

PicketReports.layout = {
    breadcrumbs: [{ title: 'Laporan', href: '/picket/reports' }],
};
