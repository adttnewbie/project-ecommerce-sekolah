import { ClipboardList } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

type UpJurusanLike = {
    name: string;
    summary: {
        revenue_7_days: number;
        up_product_count: number;
        active_consignment_count: number;
        available_stock: number;
        picket_names: string[];
    };
};

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

const formatNumber = (value: number) =>
    new Intl.NumberFormat('id-ID').format(value);

export function UpJurusanSummary({ up }: { up: UpJurusanLike }) {
    const summaryItems = [
        {
            label: 'Omzet 7 hari',
            value: formatRupiah(up.summary.revenue_7_days),
            hint: 'Gross + komisi',
        },
        {
            label: 'Produk UP aktif',
            value: `${formatNumber(up.summary.up_product_count)} produk`,
            hint: 'Milik jurusan',
        },
        {
            label: 'Titipan aktif',
            value: `${formatNumber(up.summary.active_consignment_count)} titipan`,
            hint: 'Approved/Received',
        },
        {
            label: 'Stok tersedia',
            value: `${formatNumber(up.summary.available_stock)} item`,
            hint: 'UP + titipan',
        },
    ];

    return (
        <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100">
                <CardTitle>Ringkasan {up.name}</CardTitle>
                <CardDescription>
                    Snapshot operasional untuk monitoring harian
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                    {summaryItems.map((item) => (
                        <div
                            key={item.label}
                            className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                        >
                            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                                {item.label}
                            </p>
                            <p className="mt-1 text-base font-semibold text-slate-900 tabular-nums">
                                {item.value}
                            </p>
                            <p className="text-xs text-slate-500">
                                {item.hint}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                    <p className="flex items-center gap-2 text-sm font-medium text-blue-800">
                        <ClipboardList className="size-4" />
                        Picket bertugas
                    </p>
                    <p className="mt-2 text-sm leading-6 text-blue-700">
                        {up.summary.picket_names.length > 0
                            ? up.summary.picket_names.join(', ')
                            : 'Belum ada picket officer.'}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
