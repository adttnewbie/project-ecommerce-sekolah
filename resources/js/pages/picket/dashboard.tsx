import { Head, Link, usePage } from '@inertiajs/react';
import {
    Banknote,
    CheckCircle2,
    ClipboardCheck,
    FileText,
    Package,
    ReceiptText,
    ShoppingCart,
    Store,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { EmptyState } from '@/components/admin-jurusan/empty-state';
import { PageHeader } from '@/components/admin-jurusan/page-header';
import { StatCard } from '@/components/admin-jurusan/stat-card';
import { FlashAlert } from '@/components/picket/flash-alert';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

type PosProduct = {
    id: number;
    product_name: string;
    available_quantity: number;
};

type DailyReportTransaction = {
    id: number;
    code: string;
    receipt_url: string;
    total_quantity: number;
    total_amount: number;
    commission_amount: number;
    seller_amount: number;
};

type Consignment = {
    id: number;
    seller_name: string;
    product_name: string;
    requested_quantity: number;
    received_quantity: number;
    sold_quantity: number;
    status: { code: string; label: string };
};

type Props = {
    up_jurusan: { id: number; name: string } | null;
    pos_products: PosProduct[];
    consignments: Consignment[];
    daily_report: {
        date: string;
        status: { code: 'open' | 'submitted'; label: string };
        total_sold: number;
        total_revenue: number;
        submitted_at?: string | null;
        items: DailyReportTransaction[];
    };
};

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

export default function PicketDashboard({
    up_jurusan,
    pos_products,
    consignments,
    daily_report,
}: Props) {
    const { flash } = usePage().props as unknown as {
        flash: { success?: string; error?: string };
    };
    const isSubmitted = daily_report.status.code === 'submitted';
    const lowStock = pos_products.filter(
        (product) => product.available_quantity <= 3,
    );
    const awaitingReceive = consignments.filter(
        (consignment) =>
            consignment.status.code === 'approved' &&
            consignment.received_quantity < consignment.requested_quantity,
    );

    return (
        <>
            <Head title="Dashboard Picket" />
            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    badge={up_jurusan?.name ?? 'UP Jurusan'}
                    badgeIcon={Store}
                    title="Dashboard Picket"
                    description="Selesaikan penerimaan, transaksi POS, dan laporan hari ini tanpa terlewat."
                    actions={
                        isSubmitted ? (
                            <Badge className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700 ring-1 ring-emerald-200">
                                <CheckCircle2 className="size-4" />
                                POS hari ini ditutup
                            </Badge>
                        ) : (
                            <>
                                <Button asChild className="rounded-xl">
                                    <Link href="/picket/pos">
                                        <ShoppingCart className="size-4" />
                                        Buka POS
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="rounded-xl">
                                    <Link href="/picket/reports">
                                        <FileText className="size-4" />
                                        Kirim Laporan
                                    </Link>
                                </Button>
                            </>
                        )
                    }
                />

                <FlashAlert success={flash.success} error={flash.error} />

                {isSubmitted && daily_report.submitted_at && (
                    <Alert className="rounded-xl border-emerald-200 bg-emerald-50 text-emerald-800">
                        <CheckCircle2 className="size-4" />
                        <AlertTitle className="text-emerald-900">
                            Laporan sudah dikirim
                        </AlertTitle>
                        <AlertDescription className="text-emerald-700">
                            Dikirim pukul {formatTime(daily_report.submitted_at)}.
                            Transaksi POS baru untuk hari ini sudah ditutup. Lihat ringkasan di halaman laporan.
                        </AlertDescription>
                    </Alert>
                )}

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Status Laporan"
                        value={daily_report.status.label}
                        hint={isSubmitted ? 'Sudah dikirim' : 'Masih terbuka'}
                        icon={FileText}
                        tone={isSubmitted ? 'emerald' : 'amber'}
                        href="/picket/reports"
                    />
                    <StatCard
                        label="Transaksi Hari Ini"
                        value={daily_report.items.length}
                        hint="Nota POS tercatat"
                        icon={ReceiptText}
                        tone="blue"
                        href="/picket/reports"
                    />
                    <StatCard
                        label="Item Terjual"
                        value={daily_report.total_sold}
                        hint="Total quantity out"
                        icon={Package}
                        tone="slate"
                    />
                    <StatCard
                        label="Omzet POS Hari Ini"
                        value={formatRupiah(daily_report.total_revenue)}
                        hint="Gross + komisi titipan"
                        icon={Banknote}
                        tone="emerald"
                    />
                </section>

                <section className="grid gap-4 lg:grid-cols-3">
                    <Panel
                        title="Menunggu Diterima"
                        icon={<ClipboardCheck />}
                        actionLabel="Ke Penerimaan"
                        actionHref="/picket/receiving"
                        count={awaitingReceive.length}
                    >
                        {awaitingReceive.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-5 text-center">
                                <p className="text-sm font-medium text-slate-700">
                                    Semua barang sudah diterima
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Tidak ada request approved yang menunggu penerimaan fisik.
                                </p>
                            </div>
                        ) : (
                            awaitingReceive
                                .slice(0, 5)
                                .map((item) => (
                                    <Row
                                        key={item.id}
                                        label={item.product_name}
                                        value={`${item.received_quantity}/${item.requested_quantity} item`}
                                        href="/picket/receiving"
                                        ariaLabel={`Terima ${item.product_name}`}
                                    />
                                ))
                        )}
                    </Panel>

                    <Panel
                        title="Perhatian Stok"
                        icon={<Package />}
                        actionLabel="Buka POS"
                        actionHref="/picket/pos"
                        count={lowStock.length}
                    >
                        {lowStock.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-5 text-center">
                                <p className="text-sm font-medium text-slate-700">
                                    Tidak ada stok menipis
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Semua produk masih di atas 3 item.
                                </p>
                            </div>
                        ) : (
                            lowStock
                                .slice(0, 5)
                                .map((product) => (
                                    <Row
                                        key={product.id}
                                        label={product.product_name}
                                        value={`Stok ${product.available_quantity}`}
                                        tone="warning"
                                    />
                                ))
                        )}
                    </Panel>

                    <Panel title="Nota Terbaru" icon={<ReceiptText />} count={daily_report.items.length}>
                        {daily_report.items.length === 0 ? (
                            <EmptyState
                                icon={ReceiptText}
                                title="Belum ada transaksi"
                                description="Nota POS hari ini akan muncul di sini setelah penjualan dicatat."
                            />
                        ) : (
                            daily_report.items
                                .slice(0, 5)
                                .map((item) => (
                                    <Row
                                        key={item.id}
                                        label={item.code}
                                        value={`${item.total_quantity} item`}
                                        href={item.receipt_url}
                                        ariaLabel={`Lihat nota ${item.code}`}
                                    />
                                ))
                        )}
                    </Panel>
                </section>

                <Card className="gap-0 overflow-hidden rounded-xl border-slate-200 py-0 shadow-sm">
                    <CardHeader className="p-5 pb-0 sm:p-6 sm:pb-0">
                        <CardTitle className="text-lg">Ringkasan Setoran Hari Ini</CardTitle>
                        <CardDescription>
                            Rincian transaksi yang masuk ke laporan picket. Nilai dihitung otomatis dari POS.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
                        <Metric
                            label="Omzet POS"
                            value={formatRupiah(daily_report.total_revenue)}
                        />
                        <Metric
                            label="Hak Seller Titipan"
                            value={formatRupiah(
                                daily_report.items.reduce(
                                    (total, item) => total + item.seller_amount,
                                    0,
                                ),
                            )}
                        />
                        <Metric
                            label="Pendapatan UP"
                            value={formatRupiah(
                                daily_report.items.reduce(
                                    (total, item) =>
                                        total + item.commission_amount,
                                    0,
                                ),
                            )}
                        />
                        <Metric
                            label="Jumlah Nota"
                            value={`${daily_report.items.length} transaksi`}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

PicketDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/picket/dashboard' }],
};

function Panel({
    title,
    icon,
    children,
    actionLabel,
    actionHref,
    count,
}: {
    title: string;
    icon: ReactNode;
    children: ReactNode;
    actionLabel?: string;
    actionHref?: string;
    count?: number;
}) {
    return (
        <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                        <span className="grid size-9 place-items-center rounded-xl bg-[#EFF8FF] text-[#0080FF] [&_svg]:size-5">
                            {icon}
                        </span>
                        {title}
                        {typeof count === 'number' && (
                            <Badge
                                variant="secondary"
                                className="rounded-full bg-slate-100 px-2 py-0 text-xs text-slate-600"
                            >
                                {count}
                            </Badge>
                        )}
                    </h2>
                    {actionHref && actionLabel && (
                        <Button asChild variant="ghost" size="sm" className="h-8 rounded-full px-3 text-xs">
                            <Link href={actionHref}>{actionLabel}</Link>
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-3 p-5 pt-0">{children}</CardContent>
        </Card>
    );
}

function Row({
    label,
    value,
    href,
    tone,
    ariaLabel,
}: {
    label: string;
    value: string;
    href?: string;
    tone?: 'warning';
    ariaLabel?: string;
}) {
    const content = (
        <>
            <span className="line-clamp-1 font-medium text-slate-900">{label}</span>
            <Badge
                variant="secondary"
                className={
                    tone === 'warning'
                        ? 'shrink-0 rounded-full bg-[#FFF7ED] px-2.5 py-1 text-[#EA580C] ring-1 ring-orange-200'
                        : 'shrink-0 rounded-full bg-slate-50 px-2.5 py-1 text-slate-600 ring-1 ring-slate-200'
                }
            >
                {value}
            </Badge>
        </>
    );
    const className =
        'flex min-h-11 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[#BCE0FF] hover:bg-[#EFF8FF]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0080FF]/30';

    return href ? (
        <Link href={href} aria-label={ariaLabel || label} className={className}>
            {content}
        </Link>
    ) : (
        <div className={className}>{content}</div>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 break-words text-lg font-bold tabular-nums text-slate-900">{value}</p>
        </div>
    );
}
