import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarDays,
    PackageCheck,
    ReceiptText,
    Users,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/admin-jurusan/empty-state';
import { PageHeader } from '@/components/admin-jurusan/page-header';
import { StatCard } from '@/components/admin-jurusan/stat-card';
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

type DailyReport = {
    id: number;
    picket_name: string;
    up_jurusan_name: string;
    total_sold: number;
    total_revenue: number;
    submitted_at: string | null;
};

type Props = {
    filters: { date: string };
    summary: {
        reports: number;
        pickets: number;
        items_sold: number;
        gross_amount: number;
    };
    reports: { data: DailyReport[] };
};

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

function presetDate(daysAgo: number) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);

    return d.toISOString().slice(0, 10);
}

export default function AdminJurusanReports({
    filters,
    summary,
    reports,
}: Props) {
    const [date, setDate] = useState(filters.date);
    const [loading, setLoading] = useState(false);

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        router.get(
            '/admin-jurusan/reports',
            { date },
            {
                preserveState: true,
                onFinish: () => setLoading(false),
            },
        );
    };

    const isToday = date === presetDate(0);
    const isYesterday = date === presetDate(1);

    return (
        <>
            <Head title="Laporan UP Jurusan" />
            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    badge="Rekap Transaksi"
                    title="Laporan UP Jurusan"
                    description="Cek laporan harian yang sudah dikirim picket officer. Laporan berisi ringkasan transaksi POS, omzet, dan barang terjual."
                    actions={
                        <form
                            onSubmit={submit}
                            className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center"
                        >
                            <div className="flex gap-1.5">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={isToday ? 'default' : 'outline'}
                                    className="flex-1 rounded-lg sm:flex-none"
                                    onClick={() => {
                                        const v = presetDate(0);
                                        setDate(v);
                                        router.get(
                                            '/admin-jurusan/reports',
                                            { date: v },
                                            { preserveState: true },
                                        );
                                    }}
                                >
                                    Hari ini
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={
                                        isYesterday ? 'default' : 'outline'
                                    }
                                    className="flex-1 rounded-lg sm:flex-none"
                                    onClick={() => {
                                        const v = presetDate(1);
                                        setDate(v);
                                        router.get(
                                            '/admin-jurusan/reports',
                                            { date: v },
                                            { preserveState: true },
                                        );
                                    }}
                                >
                                    Kemarin
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="h-10 rounded-lg border-slate-200 bg-white sm:w-40"
                                />
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="rounded-lg"
                                >
                                    {loading ? 'Memuat...' : 'Filter'}
                                </Button>
                            </div>
                        </form>
                    }
                />

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Laporan masuk"
                        value={summary.reports}
                        icon={ReceiptText}
                        tone="blue"
                        hint={`${summary.reports} laporan di ${filters.date}`}
                    />
                    <StatCard
                        label="Picket melapor"
                        value={summary.pickets}
                        icon={Users}
                        tone="emerald"
                        hint="Picket unik"
                    />
                    <StatCard
                        label="Item Terjual"
                        value={summary.items_sold}
                        icon={PackageCheck}
                        tone="amber"
                        hint="Qty terjual"
                    />
                    <StatCard
                        label="Omzet"
                        value={formatRupiah(summary.gross_amount)}
                        icon={Wallet}
                        tone="slate"
                        hint="Gross + komisi"
                    />
                </section>

                <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
                    <CardContent className="p-0">
                        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Laporan Masuk
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Dikirim picket setelah tutup transaksi
                                    harian. Klik Detail untuk breakdown.
                                </p>
                            </div>
                            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                                <CalendarDays className="size-3.5" />
                                {filters.date}
                            </span>
                        </div>

                        {reports.data.length === 0 ? (
                            <EmptyState
                                icon={ReceiptText}
                                title="Belum ada laporan masuk"
                                description={`Picket belum mengirim laporan pada ${filters.date}. Ingatkan picket untuk melakukan tutup harian via POS setelah transaksi selesai.`}
                            />
                        ) : (
                            <>
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Picket</TableHead>
                                                <TableHead>UP</TableHead>
                                                <TableHead>Dikirim</TableHead>
                                                <TableHead className="text-right">
                                                    Item
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Omzet
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Detail
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reports.data.map((report) => (
                                                <TableRow
                                                    key={report.id}
                                                    className="hover:bg-slate-50"
                                                >
                                                    <TableCell className="font-semibold text-slate-900">
                                                        {report.picket_name}
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">
                                                        {report.up_jurusan_name}
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">
                                                        {formatDateTime(
                                                            report.submitted_at,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums">
                                                        {report.total_sold} item
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold text-slate-900 tabular-nums">
                                                        {formatRupiah(
                                                            report.total_revenue,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            asChild
                                                            variant="outline"
                                                            size="sm"
                                                            className="rounded-lg"
                                                        >
                                                            <Link
                                                                href={`/admin-jurusan/reports/${report.id}`}
                                                            >
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
                                    {reports.data.map((report) => (
                                        <div
                                            key={report.id}
                                            className="space-y-2 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-slate-900">
                                                        {report.picket_name}
                                                    </p>
                                                    <p className="truncate text-xs text-slate-500">
                                                        {report.up_jurusan_name}{' '}
                                                        •{' '}
                                                        {formatDateTime(
                                                            report.submitted_at,
                                                        )}
                                                    </p>
                                                </div>
                                                <Link
                                                    href={`/admin-jurusan/reports/${report.id}`}
                                                    className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                                >
                                                    Detail
                                                </Link>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-600 tabular-nums">
                                                    {report.total_sold} item
                                                </span>
                                                <span className="font-semibold text-slate-900 tabular-nums">
                                                    {formatRupiah(
                                                        report.total_revenue,
                                                    )}
                                                </span>
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

AdminJurusanReports.layout = {
    breadcrumbs: [{ title: 'Laporan', href: '/admin-jurusan/reports' }],
};
