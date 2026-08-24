import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Copy, Printer, ReceiptText } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type ReceiptItem = {
    id: number;
    product_name: string;
    source: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
};

type Props = {
    sale: {
        id: number;
        code: string;
        sold_at: string | null;
        total_quantity: number;
        total_amount: number;
        up_jurusan: { id: number; name: string };
        picket: { id: number; name: string };
        items: ReceiptItem[];
    };
};

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

const formatDateTime = (value: string | null) =>
    value
        ? new Intl.DateTimeFormat('id-ID', {
              dateStyle: 'full',
              timeStyle: 'short',
          }).format(new Date(value))
        : '-';

export default function PicketReceipt({ sale }: Props) {
    const [copied, setCopied] = useState(false);
    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(sale.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // ignore
        }
    };

    return (
        <>
            <Head title={`Nota ${sale.code}`} />
            <div className="min-h-[calc(100svh-4rem)] bg-slate-50 p-4 sm:p-6 print:min-h-0 print:bg-white print:p-0">
                <div className="mx-auto max-w-3xl space-y-6">
                    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end print:hidden">
                        <div>
                            <Badge className="mb-2 rounded-full bg-[#EFF8FF] px-3 py-1 text-[#0080FF] ring-1 ring-blue-200">
                                <ReceiptText className="size-3.5" />
                                Nota POS
                            </Badge>
                            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
                                {sale.code}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={copyCode}
                                    aria-label="Salin kode nota"
                                    className="size-8 rounded-full"
                                >
                                    <Copy className="size-4" />
                                </Button>
                                {copied && <span className="text-xs font-medium text-emerald-600">Tersalin!</span>}
                            </h1>
                            <p className="mt-1 text-sm leading-6 text-slate-500">{formatDateTime(sale.sold_at)} • {sale.total_quantity} item</p>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild variant="outline" className="h-11 rounded-xl">
                                <Link href="/picket/pos">
                                    <ArrowLeft className="size-4" />
                                    POS
                                </Link>
                            </Button>
                            <Button type="button" onClick={() => window.print()} className="h-11 rounded-xl">
                                <Printer className="size-4" />
                                Print
                            </Button>
                        </div>
                    </section>

                    <Card className="overflow-hidden rounded-xl border-slate-200 p-0 shadow-sm print:rounded-none print:border-0 print:shadow-none">
                        <CardContent className="p-6 sm:p-8">
                            <header className="border-b border-slate-200 pb-6">
                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                    <div>
                                        <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">EduCart POS</p>
                                        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">{sale.up_jurusan.name}</h2>
                                        <p className="mt-1 text-sm text-slate-500">Transaksi tunai • Diinput oleh {sale.picket.name}</p>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 px-4 py-3 text-left ring-1 ring-slate-200 sm:text-right">
                                        <p className="font-mono text-sm font-bold text-slate-900">{sale.code}</p>
                                        <p className="mt-1 text-xs text-slate-500">{formatDateTime(sale.sold_at)}</p>
                                    </div>
                                </div>
                                <div className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-4 text-sm ring-1 ring-slate-200 sm:grid-cols-3">
                                    <div>
                                        <span className="text-xs font-medium tracking-wide text-slate-500 uppercase">Picket</span>
                                        <p className="mt-1 font-semibold text-slate-900">{sale.picket.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium tracking-wide text-slate-500 uppercase">Metode bayar</span>
                                        <p className="mt-1 font-semibold text-slate-900">Tunai</p>
                                    </div>
                                    <div className="sm:text-right">
                                        <span className="text-xs font-medium tracking-wide text-slate-500 uppercase">Total item</span>
                                        <p className="mt-1 font-semibold text-slate-900">{sale.total_quantity} item</p>
                                    </div>
                                </div>
                            </header>

                            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="px-4">Produk</TableHead>
                                            <TableHead className="px-4 text-right">Qty</TableHead>
                                            <TableHead className="px-4 text-right">Harga</TableHead>
                                            <TableHead className="px-4 text-right">Subtotal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sale.items.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-slate-50/70">
                                                <TableCell className="whitespace-normal px-4">
                                                    <p className="font-semibold text-slate-900">{item.product_name}</p>
                                                    <Badge className="mt-1 rounded-full bg-slate-100 px-2 py-0 text-xs text-slate-600 ring-1 ring-slate-200">
                                                        {item.source}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-4 text-right tabular-nums text-sm">{item.quantity}</TableCell>
                                                <TableCell className="px-4 text-right tabular-nums text-sm text-slate-600">
                                                    {formatRupiah(item.unit_price)}
                                                </TableCell>
                                                <TableCell className="px-4 text-right font-bold tabular-nums text-slate-900">
                                                    {formatRupiah(item.subtotal)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <footer className="mt-6 rounded-xl bg-slate-900 p-5 text-white">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm font-medium tracking-wide text-slate-300 uppercase">Total Bayar</span>
                                    <span className="text-xl font-bold tabular-nums">{formatRupiah(sale.total_amount)}</span>
                                </div>
                                <p className="mt-1 text-xs text-slate-400">{sale.total_quantity} item • Tunai</p>
                            </footer>
                            <p className="mt-6 text-center text-xs leading-5 text-slate-500">
                                Simpan nota ini sebagai bukti transaksi POS UP Jurusan. Tunjukkan ke admin jika perlu rekonsiliasi laporan.
                            </p>
                            <div className="mt-4 flex justify-center gap-2 print:hidden">
                                <Button asChild variant="outline" className="rounded-xl">
                                    <Link href="/picket/reports">Lihat Laporan</Link>
                                </Button>
                                <Button asChild className="rounded-xl">
                                    <Link href="/picket/pos">Transaksi Baru</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

PicketReceipt.layout = {
    breadcrumbs: [{ title: 'Receipt', href: '#' }],
};
