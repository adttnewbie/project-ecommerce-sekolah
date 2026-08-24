import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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

type UpJurusanLike = {
    name: string;
    revenue_chart: { day: string; revenue: number }[];
};

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

const formatNumber = (value: number) =>
    new Intl.NumberFormat('id-ID').format(value);

const revenueChartConfig = {
    revenue: { label: 'Omzet jurusan', color: '#2563eb' },
} satisfies ChartConfig;

export function UpJurusanRevenueChart({ up }: { up: UpJurusanLike }) {
    const hasData = up.revenue_chart.some((i) => i.revenue > 0);
    return (
        <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100">
                <CardTitle>Omzet Jurusan</CardTitle>
                <CardDescription>
                    {up.name} — gross produk UP + komisi titipan selama 7 hari
                    terakhir
                </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
                {!hasData ? (
                    <div className="grid h-64 place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                        <div>
                            <p className="text-sm font-medium text-slate-900">
                                Belum ada omzet
                            </p>
                            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                                Penjualan UP & komisi titipan 7 hari terakhir
                                akan muncul di sini. Tambah produk UP dan
                                approve titipan untuk mulai berjualan.
                            </p>
                        </div>
                    </div>
                ) : (
                    <ChartContainer
                        config={revenueChartConfig}
                        className="aspect-auto h-64 w-full"
                    >
                        <BarChart
                            accessibilityLayer
                            data={up.revenue_chart}
                            barCategoryGap="34%"
                            margin={{
                                top: 12,
                                right: 12,
                                left: -18,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid
                                vertical={false}
                                strokeDasharray="3 3"
                                className="stroke-slate-100"
                            />
                            <XAxis
                                dataKey="day"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                className="text-xs"
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                width={68}
                                tickFormatter={(v) =>
                                    `Rp ${formatNumber(Number(v) / 1000)}rb`
                                }
                                className="text-xs"
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        indicator="dot"
                                        formatter={(value) => (
                                            <div className="flex min-w-36 flex-1 items-center justify-between gap-3">
                                                <span className="text-muted-foreground">
                                                    Omzet jurusan
                                                </span>
                                                <span className="font-mono font-medium text-foreground tabular-nums">
                                                    {formatRupiah(
                                                        Number(value),
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        className="rounded-xl bg-white text-slate-900 ring-slate-200"
                                    />
                                }
                            />
                            <Bar
                                dataKey="revenue"
                                fill="var(--color-revenue)"
                                radius={[8, 8, 0, 0]}
                                maxBarSize={42}
                            />
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
