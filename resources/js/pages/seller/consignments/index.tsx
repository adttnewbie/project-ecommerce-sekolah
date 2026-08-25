import { Head, Link } from '@inertiajs/react';
import { Package, Plus } from 'lucide-react';
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
import { index as sellerConsignmentsIndex } from '@/routes/seller/consignments';
import { create as sellerProductsCreate } from '@/routes/seller/products';

type ConsignmentStatus =
    | 'pending_approval'
    | 'approved'
    | 'received'
    | 'completed'
    | 'rejected'
    | 'cancelled';

type Props = {
    consignments: {
        id: number;
        product_name: string;
        up_jurusan_name: string;
        requested_quantity: number;
        received_quantity: number;
        sold_quantity: number;
        commission_rate: number;
        seller_earnings: number;
        paid_amount: number;
        unpaid_amount: number;
        status: { code: ConsignmentStatus; label: string };
    }[];
};

const statusStyles: Record<ConsignmentStatus, string> = {
    pending_approval: 'bg-amber-50 text-amber-700',
    approved: 'bg-blue-50 text-blue-700',
    received: 'bg-cyan-50 text-cyan-700',
    completed: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-rose-50 text-rose-700',
    cancelled: 'bg-slate-100 text-slate-700',
};

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

export default function SellerConsignments({ consignments }: Props) {
    return (
        <>
            <Head title="Titip Barang" />
            <main className="min-h-[calc(100svh-4rem)] bg-slate-50 p-4 sm:p-6">
                <div className="space-y-6">
                    <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div>
                            <Badge className="mb-2 rounded-[6px] bg-blue-50 text-blue-700">
                                <Package className="size-3.5" />
                                {consignments.length} titipan
                            </Badge>
                            <h1 className="text-2xl font-semibold text-slate-950">
                                Titip Barang UP Jurusan
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Pantau status produk yang dijual lewat UP
                                Jurusan.
                            </p>
                        </div>
                        <Button
                            asChild
                            className="rounded-[8px] bg-blue-600 text-white hover:bg-blue-700"
                        >
                            <Link href={sellerProductsCreate()}>
                                <Plus className="size-4" /> Tambah Produk
                                Titipan
                            </Link>
                        </Button>
                    </section>

                    <Card className="gap-0 rounded-[8px] border-slate-100 py-0 shadow-sm">
                        <CardHeader className="border-b border-slate-100 p-5">
                            <CardTitle>Daftar Titipan</CardTitle>
                            <CardDescription>
                                {consignments.length === 0
                                    ? 'Belum ada produk titipan'
                                    : `${consignments.length} produk titipan • Pantau stok diterima, terjual, dan saldo`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                                            <TableHead className="px-5">
                                                Produk
                                            </TableHead>
                                            <TableHead className="px-5">
                                                UP Jurusan
                                            </TableHead>
                                            <TableHead className="px-5">
                                                Request
                                            </TableHead>
                                            <TableHead className="px-5">
                                                Diterima
                                            </TableHead>
                                            <TableHead className="px-5">
                                                Terjual
                                            </TableHead>
                                            <TableHead className="px-5">
                                                Komisi
                                            </TableHead>
                                            <TableHead className="px-5">
                                                Saldo Belum Dibayar
                                            </TableHead>
                                            <TableHead className="px-5">
                                                Status
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {consignments.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={8}
                                                    className="px-5 py-10 text-center text-sm text-slate-500"
                                                >
                                                    Belum ada request titip
                                                    barang.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {consignments.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="min-w-56 px-5 font-medium text-slate-950">
                                                    {item.product_name}
                                                </TableCell>
                                                <TableCell className="px-5 text-slate-600">
                                                    {item.up_jurusan_name}
                                                </TableCell>
                                                <TableCell className="px-5 tabular-nums">
                                                    {item.requested_quantity}
                                                </TableCell>
                                                <TableCell className="px-5 tabular-nums">
                                                    {item.received_quantity}
                                                </TableCell>
                                                <TableCell className="px-5 tabular-nums">
                                                    {item.sold_quantity}
                                                </TableCell>
                                                <TableCell className="px-5 tabular-nums">
                                                    {item.commission_rate}%
                                                </TableCell>
                                                <TableCell className="px-5 font-medium tabular-nums">
                                                    {formatRupiah(
                                                        item.unpaid_amount,
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-5">
                                                    <Badge
                                                        className={cn(
                                                            'rounded-full',
                                                            statusStyles[
                                                                item.status.code
                                                            ] ?? 'bg-slate-100 text-slate-700',
                                                        )}
                                                    >
                                                        {item.status.label}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    );
}

SellerConsignments.layout = {
    breadcrumbs: [{ title: 'Titip Barang', href: sellerConsignmentsIndex() }],
};
