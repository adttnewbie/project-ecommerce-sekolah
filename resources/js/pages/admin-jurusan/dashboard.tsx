import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Banknote,
    ClipboardCheck,
    FileCheck2,
    Inbox,
    PackageCheck,
} from 'lucide-react';
import { EmptyState } from '@/components/admin-jurusan/empty-state';
import { PageHeader } from '@/components/admin-jurusan/page-header';
import { StatCard } from '@/components/admin-jurusan/stat-card';
import { StatusBadge } from '@/components/admin-jurusan/status-badge';
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
import { cn } from '@/lib/utils';

type Dashboard = {
    today_sales: number;
    pending_requests: number;
    awaiting_receive: number;
    report_status: {
        code: 'no_picket' | 'not_submitted' | 'submitted';
        label: string;
        picket_name: string | null;
        submitted_at: string | null;
    };
    recent_requests: {
        id: number;
        seller_name: string;
        product_name: string;
        up_jurusan_name: string;
        requested_quantity: number;
        href: string;
        status: { code: string; label: string };
    }[];
};

type Props = { dashboard: Dashboard };

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

const formatTime = (value: string) =>
    new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));

export default function AdminJurusanDashboard({ dashboard }: Props) {
    return (
        <>
            <Head title="Dashboard Admin Jurusan" />
            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    badge="Admin Jurusan"
                    badgeIcon={FileCheck2}
                    title="Dashboard UP Jurusan"
                    description="Tinjau penjualan hari ini, titipan yang menunggu persetujuan, penerimaan fisik, dan laporan picket."
                    actions={
                        <>
                            <Button
                                asChild
                                variant="outline"
                                className="rounded-lg"
                            >
                                <Link href="/admin-jurusan/reports">
                                    Lihat Laporan
                                </Link>
                            </Button>
                            <Button asChild className="rounded-lg">
                                <Link href="/admin-jurusan/consignments">
                                    Tinjau Titipan
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </>
                    }
                />

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Penjualan UP Hari Ini"
                        value={formatRupiah(dashboard.today_sales)}
                        hint="Omzet gross + komisi titipan"
                        icon={Banknote}
                        tone="blue"
                        href="/admin-jurusan/reports"
                    />
                    <StatCard
                        label="Menunggu Persetujuan"
                        value={dashboard.pending_requests}
                        hint="Butuh aksi admin jurusan"
                        icon={ClipboardCheck}
                        tone={
                            dashboard.pending_requests > 0 ? 'amber' : 'slate'
                        }
                        href="/admin-jurusan/consignments"
                    />
                    <StatCard
                        label="Menunggu Diterima"
                        value={dashboard.awaiting_receive}
                        hint="Sudah di-approve, belum diterima picket"
                        icon={PackageCheck}
                        tone={dashboard.awaiting_receive > 0 ? 'blue' : 'slate'}
                        href="/admin-jurusan/consignments"
                    />
                    <StatCard
                        label="Laporan Hari Ini"
                        value={dashboard.report_status.label}
                        hint={
                            dashboard.report_status.picket_name ??
                            'Belum ada picket'
                        }
                        icon={FileCheck2}
                        tone={
                            dashboard.report_status.code === 'submitted'
                                ? 'emerald'
                                : dashboard.report_status.code ===
                                    'not_submitted'
                                  ? 'amber'
                                  : 'slate'
                        }
                        href="/admin-jurusan/reports"
                    />
                </section>

                <Card
                    className={cn(
                        'rounded-xl shadow-sm',
                        dashboard.report_status.code === 'submitted'
                            ? 'border-emerald-200 bg-emerald-50'
                            : dashboard.report_status.code === 'not_submitted'
                              ? 'border-amber-200 bg-amber-50'
                              : 'border-slate-200 bg-white',
                    )}
                >
                    <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <span
                                className={cn(
                                    'grid size-10 shrink-0 place-items-center rounded-xl',
                                    dashboard.report_status.code === 'submitted'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : dashboard.report_status.code ===
                                            'not_submitted'
                                          ? 'bg-amber-100 text-amber-700'
                                          : 'bg-slate-100 text-slate-600',
                                )}
                            >
                                <FileCheck2 className="size-5" />
                            </span>
                            <div className="min-w-0">
                                <p
                                    className={cn(
                                        'text-sm font-semibold',
                                        dashboard.report_status.code ===
                                            'submitted'
                                            ? 'text-emerald-900'
                                            : dashboard.report_status.code ===
                                                'not_submitted'
                                              ? 'text-amber-900'
                                              : 'text-slate-900',
                                    )}
                                >
                                    Laporan Hari Ini{' '}
                                    <Badge
                                        variant="secondary"
                                        className={cn(
                                            'ml-2 rounded-md text-xs',
                                            dashboard.report_status.code ===
                                                'submitted'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : dashboard.report_status
                                                        .code ===
                                                    'not_submitted'
                                                  ? 'bg-amber-100 text-amber-700'
                                                  : 'bg-slate-100 text-slate-600',
                                        )}
                                    >
                                        {dashboard.report_status.label}
                                    </Badge>
                                </p>
                                <p
                                    className={cn(
                                        'mt-1 text-sm leading-6',
                                        dashboard.report_status.code ===
                                            'submitted'
                                            ? 'text-emerald-800'
                                            : dashboard.report_status.code ===
                                                'not_submitted'
                                              ? 'text-amber-800'
                                              : 'text-slate-600',
                                    )}
                                >
                                    {dashboard.report_status.code ===
                                        'submitted' &&
                                    dashboard.report_status.submitted_at
                                        ? `${dashboard.report_status.picket_name} mengirim laporan pukul ${formatTime(dashboard.report_status.submitted_at)}.`
                                        : dashboard.report_status.code ===
                                            'not_submitted'
                                          ? `${dashboard.report_status.picket_name} belum mengirim laporan hari ini. Segera ingatkan picket untuk tutup harian.`
                                          : 'Belum ada picket yang ditugaskan ke UP Jurusan. Buat picket di halaman UP Jurusan agar operasional bisa berjalan.'}
                                </p>
                            </div>
                        </div>
                        <Button
                            asChild
                            size="sm"
                            variant={
                                dashboard.report_status.code === 'submitted'
                                    ? 'outline'
                                    : 'default'
                            }
                            className="shrink-0 rounded-lg"
                        >
                            <Link href="/admin-jurusan/reports">
                                Buka laporan
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Tindakan Titipan</CardTitle>
                            <CardDescription>
                                Request pending tertua ditampilkan lebih dahulu.
                                Selesaikan 5 teratas untuk jaga SLA.
                            </CardDescription>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="rounded-lg"
                        >
                            <Link href="/admin-jurusan/consignments">
                                Lihat Semua
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {dashboard.recent_requests.length === 0 ? (
                            <EmptyState
                                icon={Inbox}
                                title="Belum ada request titip barang"
                                description="Request seller akan muncul di sini setelah mereka memilih titip ke UP Jurusan. Pastikan UP sudah punya produk & picket."
                            />
                        ) : (
                            <>
                                {/* Desktop table */}
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Produk</TableHead>
                                                <TableHead>Seller</TableHead>
                                                <TableHead>UP</TableHead>
                                                <TableHead className="text-right">
                                                    Qty
                                                </TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">
                                                    Aksi
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {dashboard.recent_requests.map(
                                                (item) => (
                                                    <TableRow
                                                        key={item.id}
                                                        className="hover:bg-slate-50"
                                                    >
                                                        <TableCell className="font-medium text-slate-900">
                                                            {item.product_name}
                                                        </TableCell>
                                                        <TableCell className="text-slate-600">
                                                            {item.seller_name}
                                                        </TableCell>
                                                        <TableCell className="text-slate-600">
                                                            {
                                                                item.up_jurusan_name
                                                            }
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {
                                                                item.requested_quantity
                                                            }{' '}
                                                            item
                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge
                                                                code={
                                                                    item.status
                                                                        .code
                                                                }
                                                                label={
                                                                    item.status
                                                                        .label
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                asChild
                                                                size="sm"
                                                                variant="outline"
                                                                className="rounded-lg"
                                                            >
                                                                <Link
                                                                    href={
                                                                        item.href
                                                                    }
                                                                >
                                                                    Detail
                                                                </Link>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                {/* Mobile cards */}
                                <div className="divide-y divide-slate-100 md:hidden">
                                    {dashboard.recent_requests.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            className="flex flex-col gap-3 p-4 transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-slate-900">
                                                        {item.product_name}
                                                    </p>
                                                    <p className="truncate text-sm text-slate-500">
                                                        {item.seller_name} •{' '}
                                                        {item.up_jurusan_name}
                                                    </p>
                                                </div>
                                                <StatusBadge
                                                    code={item.status.code}
                                                    label={item.status.label}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-600 tabular-nums">
                                                    {item.requested_quantity}{' '}
                                                    item
                                                </span>
                                                <span className="text-xs font-medium text-blue-700">
                                                    Lihat detail →
                                                </span>
                                            </div>
                                        </Link>
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

AdminJurusanDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/admin-jurusan/dashboard' }],
};
