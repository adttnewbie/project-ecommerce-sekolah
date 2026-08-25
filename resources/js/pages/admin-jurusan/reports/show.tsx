import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    PackageCheck,
    ReceiptText,
    ShoppingBag,
    Wallet,
} from 'lucide-react';
import { PageHeader } from '@/components/admin-jurusan/page-header';
import { StatCard } from '@/components/admin-jurusan/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Report = {
    id: number;
    date: string;
    picket_name: string;
    up_jurusan_name: string;
    total_sold: number;
    total_revenue: number;
    submitted_at: string;
};

type Transaction = {
    id: string;
    code: string;
    total_quantity: number;
    total_amount: number;
    commission_amount: number;
    seller_amount: number;
    created_at: string | null;
    items: {
        id: number;
        product_name: string;
        quantity: number;
        unit_price: number;
        subtotal: number;
    }[];
};

type Props = { report: Report; transactions: Transaction[] };

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
const formatDateTime = (value: string | null) =>
    value
        ? new Date(value).toLocaleString('id-ID', {
              dateStyle: 'medium',
              timeStyle: 'short',
          })
        : '-';

export default function AdminJurusanReportDetail({
    report,
    transactions,
}: Props) {
    const totalCommission = transactions.reduce(
        (a, t) => a + t.commission_amount,
        0,
    );
    const totalSeller = transactions.reduce((a, t) => a + t.seller_amount, 0);

    return (
        <>
            <Head title={`Detail Laporan ${report.date}`} />
            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    badge={report.up_jurusan_name}
                    title="Detail Laporan Picket"
                    description={`${report.picket_name} • ${report.date} • dikirim ${formatDateTime(report.submitted_at)} — breakdown semua transaksi POS hari itu.`}
                    actions={
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="rounded-lg"
                        >
                            <Link
                                href={`/admin-jurusan/reports?date=${report.date}`}
                            >
                                <ArrowLeft className="size-4" />
                                Kembali ke {report.date}
                            </Link>
                        </Button>
                    }
                />

                <section className="grid gap-4 sm:grid-cols-3">
                    <StatCard
                        label="Transaksi"
                        value={transactions.length}
                        icon={ReceiptText}
                        tone="blue"
                        hint="POS transaksi"
                    />
                    <StatCard
                        label="Item Terjual"
                        value={report.total_sold}
                        icon={PackageCheck}
                        tone="amber"
                        hint={`${transactions.length} transaksi`}
                    />
                    <StatCard
                        label="Omzet"
                        value={formatRupiah(report.total_revenue)}
                        icon={Wallet}
                        tone="emerald"
                        hint="Gross"
                    />
                </section>

                <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
                    <CardHeader className="border-b border-slate-100">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingBag className="size-5 text-slate-500" />
                                Transaksi dalam laporan
                                <Badge
                                    variant="secondary"
                                    className="rounded-md bg-slate-100 text-slate-700"
                                >
                                    {transactions.length} transaksi
                                </Badge>
                            </CardTitle>
                            <div className="flex flex-wrap gap-2 text-xs">
                                <Badge variant="outline" className="rounded-md">
                                    Omzet {formatRupiah(report.total_revenue)}
                                </Badge>
                                <Badge className="rounded-md bg-blue-50 text-blue-700">
                                    Komisi {formatRupiah(totalCommission)}
                                </Badge>
                                <Badge className="rounded-md bg-emerald-50 text-emerald-700">
                                    Hak Seller {formatRupiah(totalSeller)}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {transactions.length === 0 ? (
                            <div className="grid place-items-center p-12 text-center">
                                <span className="grid size-12 place-items-center rounded-xl bg-slate-100 text-slate-400">
                                    <ReceiptText className="size-6" />
                                </span>
                                <p className="mt-3 text-sm font-medium text-slate-900">
                                    Belum ada transaksi
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Laporan ini belum memiliki transaksi.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="hidden overflow-x-auto md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Transaksi</TableHead>
                                                <TableHead className="text-right">
                                                    Qty
                                                </TableHead>
                                                <TableHead>Produk</TableHead>
                                                <TableHead className="text-right">
                                                    Omzet
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Komisi UP
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Hak Seller
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactions.map((trx) => (
                                                <TableRow
                                                    key={trx.id}
                                                    className="hover:bg-slate-50"
                                                >
                                                    <TableCell className="min-w-48">
                                                        <p className="font-mono text-sm font-semibold text-slate-900">
                                                            {trx.code}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {formatDateTime(
                                                                trx.created_at,
                                                            )}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums">
                                                        {trx.total_quantity}{' '}
                                                        item
                                                    </TableCell>
                                                    <TableCell className="max-w-md min-w-72 whitespace-normal">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {trx.items.map(
                                                                (item) => (
                                                                    <span
                                                                        key={
                                                                            item.id
                                                                        }
                                                                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
                                                                    >
                                                                        {
                                                                            item.product_name
                                                                        }{' '}
                                                                        ×
                                                                        {
                                                                            item.quantity
                                                                        }{' '}
                                                                        •{' '}
                                                                        {formatRupiah(
                                                                            item.subtotal,
                                                                        )}
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold text-slate-900 tabular-nums">
                                                        {formatRupiah(
                                                            trx.total_amount,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right text-blue-700 tabular-nums">
                                                        {formatRupiah(
                                                            trx.commission_amount,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-emerald-700 tabular-nums">
                                                        {formatRupiah(
                                                            trx.seller_amount,
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                {/* Mobile */}
                                <div className="divide-y divide-slate-100 md:hidden">
                                    {transactions.map((trx) => (
                                        <div
                                            key={trx.id}
                                            className="space-y-3 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-mono text-sm font-semibold text-slate-900">
                                                        {trx.code}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {formatDateTime(
                                                            trx.created_at,
                                                        )}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-slate-600 tabular-nums">
                                                    {trx.total_quantity} item
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {trx.items.map((item) => (
                                                    <span
                                                        key={item.id}
                                                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
                                                    >
                                                        {item.product_name} ×
                                                        {item.quantity}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div className="rounded-lg bg-slate-50 p-2">
                                                    <p className="text-xs text-slate-500">
                                                        Omzet
                                                    </p>
                                                    <p className="mt-1 text-xs font-semibold text-slate-900 tabular-nums">
                                                        {formatRupiah(
                                                            trx.total_amount,
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="rounded-lg bg-blue-50 p-2">
                                                    <p className="text-xs text-blue-700">
                                                        Komisi
                                                    </p>
                                                    <p className="mt-1 text-xs font-semibold text-blue-700 tabular-nums">
                                                        {formatRupiah(
                                                            trx.commission_amount,
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="rounded-lg bg-emerald-50 p-2">
                                                    <p className="text-xs text-emerald-700">
                                                        Seller
                                                    </p>
                                                    <p className="mt-1 text-xs font-semibold text-emerald-700 tabular-nums">
                                                        {formatRupiah(
                                                            trx.seller_amount,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-slate-600">
                                        Ringkasan:{' '}
                                        <span className="font-semibold text-slate-900">
                                            {transactions.length} transaksi
                                        </span>{' '}
                                        • {report.total_sold} item
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium ring-1 ring-slate-200">
                                            Omzet{' '}
                                            <span className="font-semibold">
                                                {formatRupiah(
                                                    report.total_revenue,
                                                )}
                                            </span>
                                        </span>
                                        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
                                            Komisi{' '}
                                            {formatRupiah(totalCommission)}
                                        </span>
                                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                                            Hak Seller{' '}
                                            {formatRupiah(totalSeller)}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="rounded-xl border-slate-200 bg-slate-50 shadow-sm">
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="flex items-center gap-2 text-sm text-slate-600">
                            <Banknote className="size-4" />
                            Laporan otomatis dari POS. Pastikan picket sudah
                            tutup harian setiap hari agar Admin Jurusan bisa
                            monitor.
                        </p>
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="rounded-lg"
                        >
                            <Link href="/admin-jurusan/reports">
                                Lihat laporan lain
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminJurusanReportDetail.layout = {
    breadcrumbs: [
        { title: 'Laporan', href: '/admin-jurusan/reports' },
        { title: 'Detail', href: '#' },
    ],
};
