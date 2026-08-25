import { Head, Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    ArrowUpRight,
    BadgeDollarSign,
    BarChart3,
    Boxes,
    ChevronRight,
    Clock3,
    Inbox,
    Package,
    Search,
    ShoppingBag,
    ShoppingCart,
    Store,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SellerEmptyState } from '@/components/seller/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { dashboard as sellerDashboard } from '@/routes/seller';
import { index as sellerInventoryIndex } from '@/routes/seller/inventory';
import { index as sellerOrdersIndex } from '@/routes/seller/orders';
import {
    create as sellerProductsCreate,
    index as sellerProductsIndex,
} from '@/routes/seller/products';

type StatTone = 'blue' | 'emerald' | 'amber' | 'rose';
type OrderStatus =
    'pending' | 'in_production' | 'ready' | 'packed' | 'sent' | 'completed';
type SellerIconKey =
    | 'badgeDollarSign'
    | 'boxes'
    | 'clock3'
    | 'package'
    | 'shoppingBag'
    | 'shoppingCart'
    | 'store';

type SellerDashboardProps = {
    dashboard: {
        stats: {
            label: string;
            value: string;
            context: string;
            tone: StatTone;
            icon: SellerIconKey;
        }[];
        salesData: { day: string; sales: number }[];
        activeOrderData: { key: string; label: string; value: number }[];
        orders: {
            id: number;
            source: 'online' | 'offline';
            code?: string;
            order_id: number | string;
            buyer: string;
            product: string;
            amount: string;
            meta: string | null;
            gross_amount: string | null;
            commission_amount: string | null;
            status: OrderStatus;
            time: string;
        }[];
        topProducts: {
            name: string;
            category: string;
            sold: string;
            revenue: string;
        }[];
        stockAlerts: {
            product: string;
            sku: string;
            stock: string;
            tone: 'warning' | 'danger';
        }[];
        tasks: {
            title: string;
            detail: string;
            action: string;
            icon: SellerIconKey;
            tone: StatTone;
        }[];
    };
};

const iconMap: Record<SellerIconKey, LucideIcon> = {
    badgeDollarSign: BadgeDollarSign,
    boxes: Boxes,
    clock3: Clock3,
    package: Package,
    shoppingBag: ShoppingBag,
    shoppingCart: ShoppingCart,
    store: Store,
};

const toneStyles: Record<StatTone, string> = {
    blue: 'border border-[#BCE0FF] bg-[#EFF8FF] text-[#0080FF]',
    emerald: 'border border-[#BBF7D0] bg-[#ECFDF3] text-[#16A34A]',
    amber: 'border border-[#FFEDD5] bg-[#FFF7ED] text-[#EA580C]',
    rose: 'border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]',
};

const statusStyles: Record<OrderStatus, string> = {
    pending: 'border border-[#BCE0FF] bg-[#EFF8FF] text-[#0080FF]',
    in_production: 'border border-[#DDD6FE] bg-[#F5F3FF] text-[#7C3AED]',
    ready: 'border border-[#A5F3FC] bg-[#ECFEFF] text-[#0891B2]',
    packed: 'border border-[#FFEDD5] bg-[#FFF7ED] text-[#EA580C]',
    sent: 'border border-[#C7D2FE] bg-[#EEF2FF] text-[#4338CA]',
    completed: 'border border-[#BBF7D0] bg-[#ECFDF3] text-[#16A34A]',
};

const statusLabels: Record<OrderStatus, string> = {
    pending: 'Menunggu',
    in_production: 'Diproduksi',
    ready: 'Siap',
    packed: 'Dikemas',
    sent: 'Dikirim',
    completed: 'Selesai',
};

const salesConfig = {
    sales: { label: 'Pendapatan seller', color: '#0080FF' },
} satisfies ChartConfig;

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

function StatCard({
    stat,
}: {
    stat: SellerDashboardProps['dashboard']['stats'][number];
}) {
    const Icon = iconMap[stat.icon];

    return (
        <Card className="gap-0 rounded-[14px] border-slate-100 py-0 shadow-sm transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-md motion-reduce:transition-none">
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-sm text-slate-500">{stat.label}</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950 tabular-nums">
                            {stat.value}
                        </p>
                    </div>
                    <span
                        className={`grid size-10 shrink-0 place-items-center rounded-[10px] ${toneStyles[stat.tone]}`}
                        aria-hidden="true"
                    >
                        <Icon className="size-5" aria-hidden="true" />
                    </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{stat.context}</p>
            </CardContent>
        </Card>
    );
}

export default function SellerDashboard({
    dashboard: data,
}: SellerDashboardProps) {
    const hasSales = data.salesData.some((item) => item.sales > 0);
    const taskHref = (action: string) => {
        if (action === 'Tambah produk') {
            return sellerProductsCreate();
        }

        if (action === 'Lihat produk') {
            return sellerProductsIndex();
        }

        return sellerOrdersIndex();
    };

    return (
        <>
            <Head title="Dashboard Seller" />
            <main className="min-h-[calc(100svh-4rem)] bg-slate-50 p-4 sm:p-6">
                <div className="space-y-8">
                    <header>
                        <Badge className="mb-2 rounded-[6px] border border-[#BBF7D0] bg-[#ECFDF3] text-[#16A34A]">
                            Pusat Seller
                        </Badge>
                        <h1 className="text-2xl font-semibold text-slate-950">
                            Dashboard Seller
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm text-slate-500">
                            Lihat pendapatan yang diakui dan selesaikan
                            pekerjaan toko yang masih menunggu.
                        </p>
                    </header>

                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {data.stats.map((stat) => (
                            <StatCard key={stat.label} stat={stat} />
                        ))}
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-slate-950">
                            Status Pesanan Aktif
                        </h2>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {data.activeOrderData.map((item) => (
                                <Link
                                    key={item.key}
                                    href={sellerOrdersIndex()}
                                    aria-label={`Lihat pesanan ${item.label}`}
                                    className="rounded-[14px] border border-slate-100 bg-white p-4 shadow-sm transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-[#BCE0FF] hover:bg-[#EFF8FF]/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                                >
                                    <p className="text-sm text-slate-500">
                                        {item.label}
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold text-slate-950 tabular-nums">
                                        {item.value}
                                    </p>
                                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#0080FF]">
                                        Lihat pesanan
                                        <ChevronRight className="size-3.5" aria-hidden="true" />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>

                    <section className="grid gap-6 lg:grid-cols-2">
                        <Card className="gap-0 rounded-[14px] border-slate-100 py-0 shadow-sm transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-md motion-reduce:transition-none">
                            <CardHeader className="p-5 pb-4">
                                <CardTitle>Tugas Seller</CardTitle>
                                <CardDescription>
                                    Pekerjaan operasional yang memerlukan
                                    perhatian.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 p-5 pt-0">
                                {data.tasks.length === 0 ? (
                                    <SellerEmptyState
                                        icon={Package}
                                        title="Tidak ada tugas mendesak"
                                        description="Semua pekerjaan operasional sudah beres. Cek lagi nanti atau tambah produk baru."
                                        actionHref={sellerProductsCreate().url}
                                        actionLabel="Tambah Produk"
                                    />
                                ) : (
                                    data.tasks.map((task) => {
                                        const Icon = iconMap[task.icon];

                                        return (
                                            <div
                                                key={task.title}
                                                className="flex flex-col items-stretch gap-3 rounded-[12px] border border-slate-100 p-3 sm:flex-row sm:items-center transition-colors duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[#BCE0FF] hover:bg-[#EFF8FF]/30 motion-reduce:transition-none"
                                            >
                                                <div className="flex min-w-0 items-start gap-3 sm:flex-1 sm:items-center">
                                                    <span
                                                        className={`grid size-9 shrink-0 place-items-center rounded-[10px] ${toneStyles[task.tone]}`}
                                                        aria-hidden="true"
                                                    >
                                                        <Icon className="size-4" aria-hidden="true" />
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold text-slate-950">
                                                            {task.title}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {task.detail}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    className="h-11 min-h-11 w-full shrink-0 rounded-[12px] border-slate-200 bg-white px-4 font-semibold transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2 motion-reduce:transition-none sm:w-auto"
                                                >
                                                    <Link
                                                        href={taskHref(
                                                            task.action,
                                                        )}
                                                    >
                                                        {task.action}
                                                    </Link>
                                                </Button>
                                            </div>
                                        );
                                    })
                                )}
                            </CardContent>
                        </Card>

                        <Card className="gap-0 rounded-[14px] border-slate-100 py-0 shadow-sm transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-md motion-reduce:transition-none">
                            <CardHeader className="p-5 pb-4">
                                <CardTitle>Perhatian Stok</CardTitle>
                                <CardDescription>
                                    Stok habis dan menipis untuk produk siap
                                    jual.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 p-5 pt-0">
                                {data.stockAlerts.length === 0 ? (
                                    <SellerEmptyState
                                        icon={Search}
                                        title="Stok produk aman"
                                        description="Tidak ada produk hampir habis. Pantau inventori untuk restock tepat waktu."
                                        actionHref={sellerInventoryIndex().url}
                                        actionLabel="Kelola Inventori"
                                    />
                                ) : (
                                    data.stockAlerts.map((item) => (
                                        <div
                                            key={item.sku}
                                            className={cn(
                                                'flex items-center justify-between gap-3 rounded-[12px] border p-3 transition-colors duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
                                                item.tone === 'danger'
                                                    ? 'border-[#FECACA] bg-[#FEF2F2]/70'
                                                    : 'border-[#FFEDD5] bg-[#FFF7ED]/70',
                                            )}
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <AlertTriangle
                                                    className={cn(
                                                        'size-4 shrink-0',
                                                        item.tone === 'danger'
                                                            ? 'text-[#DC2626]'
                                                            : 'text-[#EA580C]',
                                                    )}
                                                    aria-hidden="true"
                                                />
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold">
                                                        {item.product}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        Stok {item.stock}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="h-11 min-h-11 shrink-0 rounded-[12px] border-slate-200 bg-white px-4 font-semibold transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2 motion-reduce:transition-none"
                                            >
                                                <Link
                                                    href={sellerInventoryIndex()}
                                                    aria-label={`Kelola stok ${item.product}`}
                                                >
                                                    Kelola stok
                                                </Link>
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </section>

                    <Card className="gap-0 rounded-[14px] border-slate-100 py-0 shadow-sm transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-md motion-reduce:transition-none">
                        <CardHeader className="p-5 pb-0">
                            <CardTitle>Pendapatan 7 Hari Terakhir</CardTitle>
                            <CardDescription>
                                Pendapatan dari pesanan online terbayar dan hak
                                seller dari POS.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5">
                            {!hasSales ? (
                                <SellerEmptyState
                                    icon={BarChart3}
                                    title="Belum ada pendapatan"
                                    description="Pendapatan 7 hari terakhir kosong. Transaksi terbayar akan muncul di grafik ini."
                                    actionHref={sellerOrdersIndex().url}
                                    actionLabel="Lihat Pesanan"
                                />
                            ) : (
                                <ChartContainer
                                    config={salesConfig}
                                    className="aspect-auto h-72 w-full"
                                >
                                    <AreaChart
                                        accessibilityLayer
                                        data={data.salesData}
                                        margin={{
                                            left: -10,
                                            right: 12,
                                            top: 12,
                                        }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="seller-sales"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="var(--color-sales)"
                                                    stopOpacity={0.3}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="var(--color-sales)"
                                                    stopOpacity={0.02}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="day"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={10}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            width={76}
                                            tickFormatter={(value) =>
                                                `Rp ${Number(value) / 1000}rb`
                                            }
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={
                                                <ChartTooltipContent
                                                    formatter={(value) => (
                                                        <div className="flex min-w-40 flex-1 items-center justify-between gap-3">
                                                            <span className="text-muted-foreground">
                                                                Pendapatan
                                                                seller
                                                            </span>
                                                            <span className="font-mono font-medium">
                                                                {formatRupiah(
                                                                    Number(
                                                                        value,
                                                                    ),
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                />
                                            }
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="sales"
                                            stroke="var(--color-sales)"
                                            fill="url(#seller-sales)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>

                    <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                        <Card className="gap-0 rounded-[14px] border-slate-100 py-0 shadow-sm transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-md motion-reduce:transition-none">
                            <CardHeader className="flex-row items-center justify-between border-b border-slate-100 p-5">
                                <div>
                                    <CardTitle>Transaksi Terbaru</CardTitle>
                                    <CardDescription>
                                        Pesanan online dan penjualan POS
                                        terbaru.
                                    </CardDescription>
                                </div>
                                <Button asChild variant="ghost" className="h-11 min-h-11 rounded-[12px] font-semibold transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2 motion-reduce:transition-none">
                                    <Link href={sellerOrdersIndex()}>
                                        Semua transaksi
                                        <ArrowUpRight className="size-4" aria-hidden="true" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="overflow-x-auto p-0">
                                <Table className="min-w-[760px]">
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="px-5">
                                                Kode
                                            </TableHead>
                                            <TableHead>Produk</TableHead>
                                            <TableHead>Nilai</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="pr-5">
                                                Waktu
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.orders.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    className="p-0"
                                                >
                                                    <SellerEmptyState
                                                        icon={Inbox}
                                                        title="Belum ada transaksi"
                                                        description="Transaksi online dan POS terbaru akan tampil di sini."
                                                        actionHref={sellerOrdersIndex().url}
                                                        actionLabel="Lihat Pesanan"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {data.orders.map((order) => (
                                            <TableRow
                                                key={`${order.source}-${order.id}`}
                                            >
                                                <TableCell className="px-5 font-medium">
                                                    <div className="space-y-1">
                                                        <p>
                                                            {order.code ??
                                                                `#${order.order_id}`}
                                                        </p>
                                                        <Badge
                                                            className={
                                                                order.source ===
                                                                'offline'
                                                                    ? 'bg-emerald-50 text-emerald-700'
                                                                    : 'bg-blue-50 text-blue-700'
                                                            }
                                                        >
                                                            {order.source ===
                                                            'offline'
                                                                ? 'POS'
                                                                : 'Online'}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {order.product}
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    {order.amount}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            statusStyles[
                                                                order.status
                                                            ]
                                                        }
                                                    >
                                                        {
                                                            statusLabels[
                                                                order.status
                                                            ]
                                                        }
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="pr-5 text-slate-500">
                                                    <time dateTime={order.time} className="tabular-nums">
                                                        {order.time}
                                                    </time>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <Card className="gap-0 rounded-[14px] border-slate-100 py-0 shadow-sm transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-md motion-reduce:transition-none">
                            <CardHeader className="p-5 pb-4">
                                <CardTitle>Produk Terlaris Online</CardTitle>
                                <CardDescription>
                                    Pesanan online terbayar, sepanjang waktu.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-5 pt-0">
                                {data.topProducts.length === 0 ? (
                                    <SellerEmptyState
                                        icon={Package}
                                        title="Belum ada penjualan"
                                        description="Produk terlaris dari pesanan terbayar akan muncul di sini."
                                        actionHref={sellerProductsIndex().url}
                                        actionLabel="Lihat Produk"
                                    />
                                ) : (
                                    <ul className="space-y-4">
                                        {data.topProducts.map(
                                            (product, index) => (
                                                <li
                                                    key={product.name}
                                                    className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold">
                                                            {index + 1}.{' '}
                                                            {product.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {product.category}
                                                        </p>
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <p className="text-sm font-semibold">
                                                            {product.sold}
                                                        </p>
                                                        <p className="text-xs text-emerald-600">
                                                            {product.revenue}
                                                        </p>
                                                    </div>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </main>
        </>
    );
}

SellerDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard Seller', href: sellerDashboard() }],
};
