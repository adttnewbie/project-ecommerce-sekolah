import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Check, Eye, Inbox, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/admin-jurusan/empty-state';
import { PageHeader } from '@/components/admin-jurusan/page-header';
import { StatusBadge } from '@/components/admin-jurusan/status-badge';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Textarea } from '@/components/ui/textarea';

type Props = {
    consignments: {
        data: {
            id: number;
            seller_name: string;
            product_name: string;
            up_jurusan_name: string;
            requested_quantity: number;
            status: { code: string; label: string };
        }[];
        total: number;
        links?: { url: string | null; label: string; active: boolean }[];
    };
};

const filters = [
    { value: 'all', label: 'Semua' },
    { value: 'pending_approval', label: 'Menunggu' },
    { value: 'approved', label: 'Disetujui' },
    { value: 'received', label: 'Diterima' },
    { value: 'completed', label: 'Selesai' },
    { value: 'rejected', label: 'Ditolak' },
] as const;

export default function AdminJurusanConsignments({ consignments }: Props) {
    const { flash } = usePage().props as unknown as {
        flash: { success?: string; error?: string };
    };
    const [q, setQ] = useState('');
    const [status, setStatus] = useState<string>('all');

    const counts = useMemo(() => {
        const c: Record<string, number> = { all: consignments.data.length };
        consignments.data.forEach((i) => {
            c[i.status.code] = (c[i.status.code] ?? 0) + 1;
        });
        return c;
    }, [consignments.data]);

    const filtered = useMemo(() => {
        return consignments.data.filter((item) => {
            const matchStatus = status === 'all' || item.status.code === status;
            const matchSearch =
                !q ||
                item.product_name.toLowerCase().includes(q.toLowerCase()) ||
                item.seller_name.toLowerCase().includes(q.toLowerCase()) ||
                item.up_jurusan_name.toLowerCase().includes(q.toLowerCase());
            return matchStatus && matchSearch;
        });
    }, [consignments.data, status, q]);

    return (
        <>
            <Head title="Request Titip Barang" />
            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    badge="Review Seller"
                    title="Request Titip Barang"
                    description="Setujui barang yang layak masuk UP Jurusan atau tolak sebelum stok tercatat. Aksi cepat jaga SLA picket & seller."
                    actions={
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
                            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                                Total request
                            </p>
                            <p className="mt-1 text-2xl font-semibold text-slate-900 tabular-nums">
                                {consignments.total}
                            </p>
                        </div>
                    }
                />

                {(flash.success || flash.error) && (
                    <Alert
                        variant={flash.error ? 'destructive' : 'default'}
                        className={
                            flash.error
                                ? 'border-rose-200 bg-rose-50 text-rose-700'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        }
                    >
                        <AlertTitle>
                            {flash.error ? 'Gagal' : 'Berhasil'}
                        </AlertTitle>
                        <AlertDescription>
                            {flash.error || flash.success}
                        </AlertDescription>
                    </Alert>
                )}

                <Card className="rounded-xl border-slate-200 shadow-sm">
                    <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-wrap gap-1.5">
                                {filters.map((f) => (
                                    <button
                                        key={f.value}
                                        onClick={() => setStatus(f.value)}
                                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                                            status === f.value
                                                ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        {f.label}
                                        <Badge
                                            variant="secondary"
                                            className={`ml-1.5 rounded-full px-1.5 py-0 text-[11px] ${
                                                status === f.value
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            {counts[f.value] ?? 0}
                                        </Badge>
                                    </button>
                                ))}
                            </div>
                            <div className="relative w-full sm:max-w-xs">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Cari produk, seller, UP..."
                                    className="h-10 rounded-lg border-slate-200 bg-white pl-9"
                                    aria-label="Cari request titip"
                                />
                                {q && (
                                    <button
                                        onClick={() => setQ('')}
                                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                        aria-label="Hapus pencarian"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                        {filtered.length !== consignments.data.length && (
                            <p className="text-xs text-slate-500">
                                Menampilkan {filtered.length} dari{' '}
                                {consignments.data.length} request di halaman
                                ini
                                {q && <> untuk “{q}”</>} • Status:{' '}
                                {filters.find((f) => f.value === status)?.label}
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
                    <CardContent className="p-0">
                        {consignments.data.length === 0 ? (
                            <EmptyState
                                icon={Inbox}
                                title="Belum ada request titip barang"
                                description="Request seller akan muncul di sini setelah mereka memilih titip ke UP Jurusan. Pastikan UP sudah punya produk & picket agar seller bisa memilih."
                            />
                        ) : filtered.length === 0 ? (
                            <EmptyState
                                icon={Search}
                                title="Tidak ada hasil"
                                description={`Tidak ada request dengan status "${filters.find((f) => f.value === status)?.label}" dan kata kunci "${q}". Coba ubah filter atau hapus pencarian.`}
                            />
                        ) : (
                            <>
                                {/* Desktop */}
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Produk</TableHead>
                                                <TableHead>
                                                    UP Jurusan
                                                </TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">
                                                    Aksi
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filtered.map((item) => (
                                                <TableRow
                                                    key={item.id}
                                                    className="hover:bg-slate-50"
                                                >
                                                    <TableCell className="max-w-[320px]">
                                                        <p className="truncate font-medium text-slate-900">
                                                            {item.product_name}
                                                        </p>
                                                        <p className="truncate text-xs text-slate-500">
                                                            {item.seller_name} •{' '}
                                                            {
                                                                item.requested_quantity
                                                            }{' '}
                                                            item
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">
                                                        {item.up_jurusan_name}
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge
                                                            code={
                                                                item.status.code
                                                            }
                                                            label={
                                                                item.status
                                                                    .label
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                asChild
                                                                size="sm"
                                                                variant="outline"
                                                                className="rounded-lg"
                                                            >
                                                                <Link
                                                                    href={`/admin-jurusan/consignments/${item.id}`}
                                                                >
                                                                    <Eye className="size-4" />
                                                                    Detail
                                                                </Link>
                                                            </Button>
                                                            {item.status
                                                                .code ===
                                                                'pending_approval' && (
                                                                <>
                                                                    <Form
                                                                        action={`/admin-jurusan/consignments/${item.id}/approve`}
                                                                        method="post"
                                                                        disableWhileProcessing
                                                                    >
                                                                        {({
                                                                            processing,
                                                                        }) => (
                                                                            <Button
                                                                                type="submit"
                                                                                size="sm"
                                                                                className="rounded-lg"
                                                                                disabled={
                                                                                    processing
                                                                                }
                                                                            >
                                                                                <Check className="size-4" />
                                                                                {processing
                                                                                    ? '...'
                                                                                    : 'Approve'}
                                                                            </Button>
                                                                        )}
                                                                    </Form>
                                                                    <RejectConsignmentDialog
                                                                        item={
                                                                            item
                                                                        }
                                                                    />
                                                                </>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile */}
                                <div className="divide-y divide-slate-100 md:hidden">
                                    {filtered.map((item) => (
                                        <div
                                            key={item.id}
                                            className="space-y-3 p-4"
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
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {
                                                            item.requested_quantity
                                                        }{' '}
                                                        item
                                                    </p>
                                                </div>
                                                <StatusBadge
                                                    code={item.status.code}
                                                    label={item.status.label}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1 rounded-lg"
                                                >
                                                    <Link
                                                        href={`/admin-jurusan/consignments/${item.id}`}
                                                    >
                                                        <Eye className="size-4" />
                                                        Detail
                                                    </Link>
                                                </Button>
                                                {item.status.code ===
                                                    'pending_approval' && (
                                                    <>
                                                        <Form
                                                            action={`/admin-jurusan/consignments/${item.id}/approve`}
                                                            method="post"
                                                            disableWhileProcessing
                                                            className="flex-1"
                                                        >
                                                            {({
                                                                processing,
                                                            }) => (
                                                                <Button
                                                                    type="submit"
                                                                    size="sm"
                                                                    className="w-full rounded-lg"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                >
                                                                    <Check className="size-4" />
                                                                    Approve
                                                                </Button>
                                                            )}
                                                        </Form>
                                                    </>
                                                )}
                                            </div>
                                            {item.status.code ===
                                                'pending_approval' && (
                                                <div className="flex justify-end">
                                                    <RejectConsignmentDialog
                                                        item={item}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {consignments.links &&
                                    consignments.links.length > 3 && (
                                        <div className="flex flex-wrap items-center justify-center gap-1 border-t border-slate-100 p-3">
                                            {consignments.links.map(
                                                (link, idx) => (
                                                    <Button
                                                        key={idx}
                                                        asChild={!!link.url}
                                                        variant={
                                                            link.active
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        size="sm"
                                                        disabled={!link.url}
                                                        className="min-w-9 rounded-lg"
                                                    >
                                                        {link.url ? (
                                                            <Link
                                                                href={link.url}
                                                                dangerouslySetInnerHTML={{
                                                                    __html: link.label,
                                                                }}
                                                            />
                                                        ) : (
                                                            <span
                                                                dangerouslySetInnerHTML={{
                                                                    __html: link.label,
                                                                }}
                                                            />
                                                        )}
                                                    </Button>
                                                ),
                                            )}
                                        </div>
                                    )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function RejectConsignmentDialog({
    item,
}: {
    item: Props['consignments']['data'][number];
}) {
    const [reason, setReason] = useState('');
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-lg"
                >
                    <X className="size-4" />
                    Reject
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-xl bg-white">
                <AlertDialogHeader>
                    <AlertDialogTitle>Tolak request titip?</AlertDialogTitle>
                    <AlertDialogDescription>
                        <span className="font-medium text-slate-900">
                            {item.product_name}
                        </span>{' '}
                        dari {item.seller_name} akan ditolak dan status produk
                        seller ikut menjadi rejected. Tulis alasan yang jelas
                        agar seller bisa perbaiki.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <Form
                    action={`/admin-jurusan/consignments/${item.id}/reject`}
                    method="post"
                    disableWhileProcessing
                    className="space-y-4"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="space-y-2">
                                <Textarea
                                    name="rejection_reason"
                                    required
                                    maxLength={1000}
                                    placeholder="Contoh: Foto kurang jelas, deskripsi tidak sesuai, stok tidak meyakinkan..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    aria-invalid={Boolean(
                                        errors.rejection_reason,
                                    )}
                                    className="min-h-28 rounded-lg"
                                />
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-rose-600">
                                        {errors.rejection_reason}
                                    </p>
                                    <span
                                        className={`text-xs tabular-nums ${reason.length > 900 ? 'text-amber-600' : 'text-slate-400'}`}
                                    >
                                        {reason.length}/1000
                                    </span>
                                </div>
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-lg"
                                        disabled={processing}
                                    >
                                        Batal
                                    </Button>
                                </AlertDialogCancel>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    className="rounded-lg"
                                    disabled={processing || !reason.trim()}
                                >
                                    {processing ? 'Memproses...' : 'Reject'}
                                </Button>
                            </AlertDialogFooter>
                        </>
                    )}
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    );
}

AdminJurusanConsignments.layout = {
    breadcrumbs: [{ title: 'Titipan', href: '/admin-jurusan/consignments' }],
};
