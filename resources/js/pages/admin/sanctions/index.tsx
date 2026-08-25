import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Ban,
    Clock3,
    Gavel,
    Inbox,
    RotateCcw,
    SearchX,
    Settings2,
    ShieldAlert,
    ShieldX,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
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
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type CodeLabel = { code: string; label: string };

type SanctionRow = {
    id: number;
    type: CodeLabel;
    status: CodeLabel;
    reason: string | null;
    issued_by: string;
    starts_at: string;
    ends_at: string | null;
    is_expired: boolean;
    can_lift: boolean;
    buyer: { id: number; name: string; email: string };
};

type ViolationRow = {
    id: number;
    type: CodeLabel;
    points: number;
    description: string | null;
    occurred_at: string;
    order_id: number | null;
    order_code: string | null;
    buyer: { id: number; name: string; email: string };
};

type BuyerOption = { id: number; name: string; email: string };

type SanctionSettings = {
    window_days: number;
    warning_points: number;
    receipt_force_complete_count: number;
};

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links?: Array<{ url: string | null; label: string; active: boolean }>;
    next_page_url?: string | null;
    prev_page_url?: string | null;
};

type Props = {
    sanctions: Paginated<SanctionRow>;
    violations: Paginated<ViolationRow>;
    buyers: BuyerOption[];
    settings: SanctionSettings;
    violation_types: Array<CodeLabel & { points: number }>;
};

const formatDate = (value: string) =>
    new Date(value).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

const sanctionBadgeClass = (code: string) => {
    switch (code) {
        case 'warning':
            return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
        case 'checkout_ban':
            return 'bg-orange-50 text-orange-700 ring-1 ring-orange-200';
        case 'review_ban':
            return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200';
        default:
            return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';
    }
};

function PaginationBar({
    paginator,
}: {
    paginator: Paginated<unknown>;
}) {
    if (!paginator || paginator.last_page <= 1) return null;

    const hasLinks = paginator.links && paginator.links.length > 3;

    if (hasLinks && paginator.links) {
        return (
            <div className="flex flex-col gap-3 border-t border-slate-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                    Menampilkan {paginator.from ?? 0}–{paginator.to ?? 0} dari{' '}
                    {paginator.total} data{' '}
                    <span className="hidden sm:inline">•</span>{' '}
                    <span className="font-medium text-slate-700">
                        Halaman {paginator.current_page} dari{' '}
                        {paginator.last_page}
                    </span>
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                    {paginator.links.map((link, idx) => {
                        const isFirst = idx === 0;
                        const isLast = idx === paginator.links!.length - 1;
                        const rawLabel = link.label ?? '';
                        // Laravel uses &laquo; &raquo; and ... for ellipsis
                        const isEllipsis =
                            rawLabel.includes('...') ||
                            rawLabel === '...' ||
                            rawLabel.includes('&hellip;');
                        if (isEllipsis) {
                            return (
                                <span
                                    key={`ellipsis-${idx}`}
                                    className="px-2 text-slate-400"
                                >
                                    …
                                </span>
                            );
                        }
                        const label = isFirst
                            ? 'Sebelumnya'
                            : isLast
                              ? 'Berikutnya'
                              : rawLabel.replace(/<[^>]*>/g, '').trim();
                        return (
                            <Button
                                key={`${rawLabel}-${idx}`}
                                asChild={Boolean(link.url)}
                                disabled={!link.url}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                className={cn(
                                    'h-9 min-w-9 rounded-[8px] px-3 text-sm font-medium',
                                    link.active
                                        ? 'bg-[#0080FF] text-white hover:bg-[#006FE0]'
                                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                                )}
                                aria-current={
                                    link.active ? 'page' : undefined
                                }
                            >
                                {link.url ? (
                                    <Link
                                        href={link.url}
                                        preserveScroll
                                        preserveState
                                    >
                                        {label}
                                    </Link>
                                ) : (
                                    <span>{label}</span>
                                )}
                            </Button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Fallback: prev/next via urls or current_page
    const prevUrl = paginator.prev_page_url ?? null;
    const nextUrl = paginator.next_page_url ?? null;
    return (
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
                Menampilkan {paginator.from ?? 0}–{paginator.to ?? 0} dari{' '}
                {paginator.total} data{' '}
                <span className="hidden sm:inline">•</span>{' '}
                <span className="font-medium text-slate-700">
                    Halaman {paginator.current_page} dari {paginator.last_page}
                </span>
            </p>
            <div className="flex items-center gap-2">
                <Button
                    asChild={Boolean(prevUrl)}
                    disabled={!prevUrl}
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-[8px] border-slate-200 bg-white px-4 font-medium text-slate-700 hover:bg-slate-50"
                >
                    {prevUrl ? (
                        <Link href={prevUrl} preserveScroll preserveState>
                            Sebelumnya
                        </Link>
                    ) : (
                        <span>Sebelumnya</span>
                    )}
                </Button>
                <Button
                    asChild={Boolean(nextUrl)}
                    disabled={!nextUrl}
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-[8px] border-slate-200 bg-white px-4 font-medium text-slate-700 hover:bg-slate-50"
                >
                    {nextUrl ? (
                        <Link href={nextUrl} preserveScroll preserveState>
                            Berikutnya
                        </Link>
                    ) : (
                        <span>Berikutnya</span>
                    )}
                </Button>
            </div>
        </div>
    );
}

export default function AdminSanctions({
    sanctions,
    violations,
    buyers,
    settings,
    violation_types,
}: Props) {
    const { flash } = usePage().props;

    const [buyerQuery, setBuyerQuery] = useState('');
    const [selectedBuyerId, setSelectedBuyerId] = useState<string>('');

    const selectedBuyer = useMemo(
        () => buyers.find((b) => String(b.id) === selectedBuyerId) ?? null,
        [buyers, selectedBuyerId],
    );

    const filteredBuyers = useMemo(() => {
        const q = buyerQuery.trim().toLowerCase();
        if (!q) return buyers;
        return buyers.filter((b) =>
            `${b.name} ${b.email}`.toLowerCase().includes(q),
        );
    }, [buyers, buyerQuery]);

    const sanctionsTotal = sanctions.total ?? sanctions.data.length;
    const violationsTotal = violations.total ?? violations.data.length;

    return (
        <>
            <Head title="Sanksi Buyer" />
            {/* pertahankan spacing-x parent: p-4 sm:p-6 + space-y-6 */}
            <main className="min-h-[calc(100svh-4rem)] bg-slate-50 p-4 sm:p-6">
                <div className="space-y-6">
                    <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div className="min-w-0">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <Badge className="rounded-[6px] bg-blue-50 text-blue-700 ring-1 ring-blue-200">
                                    <ShieldAlert className="size-3.5" />
                                    Admin Center
                                </Badge>
                                <Badge className="rounded-[6px] bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                                    <Gavel className="size-3.5" />
                                    {violationsTotal} pelanggaran terbaru
                                </Badge>
                                {sanctionsTotal > 0 && (
                                    <Badge className="rounded-[6px] bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                                        <ShieldX className="size-3.5" />
                                        {sanctionsTotal} sanksi tercatat
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                                Sanksi Buyer
                            </h1>
                            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                                Pantau pelanggaran buyer, berikan sanksi manual
                                dengan cepat, dan atur ambang peringatan
                                otomatis sesuai kebijakan toko.
                            </p>
                        </div>
                    </section>

                    {(flash?.success || flash?.error) && (
                        <div
                            role="status"
                            aria-live="polite"
                            className={cn(
                                'rounded-[8px] border px-4 py-3 text-sm leading-6 shadow-sm',
                                flash.error
                                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                                    : 'border-emerald-200 bg-emerald-50 text-emerald-700',
                            )}
                        >
                            {flash.error || flash.success}
                        </div>
                    )}

                    {/* Daftar Sanksi */}
                    <Card className="gap-0 overflow-hidden rounded-[8px] border border-slate-100 bg-white py-0 shadow-sm">
                        <CardHeader className="border-b border-slate-100 p-6">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-950">
                                        <span className="flex size-8 items-center justify-center rounded-[8px] bg-rose-50 text-rose-600 ring-1 ring-rose-200">
                                            <Ban className="size-4" />
                                        </span>
                                        Daftar Sanksi
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        Peringatan diberikan otomatis oleh sistem
                                        saat ambang tercapai. Ban dapat dicabut
                                        kapan saja oleh admin.
                                    </CardDescription>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="w-fit rounded-[6px] bg-slate-50 text-slate-600 ring-1 ring-slate-200"
                                >
                                    {sanctions.from ?? 0}–{sanctions.to ?? 0}{' '}
                                    dari {sanctions.total ?? 0}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {sanctions.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                                    <div className="flex size-12 items-center justify-center rounded-[14px] bg-slate-50 text-slate-400 ring-1 ring-slate-200">
                                        <Inbox className="size-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-semibold text-slate-900">
                                            Belum ada sanksi
                                        </h3>
                                        <p className="mx-auto max-w-sm text-sm leading-6 text-slate-500">
                                            Saat ambang peringatan tercapai,
                                            sistem akan membuat sanksi otomatis.
                                            Anda juga bisa memberi sanksi manual
                                            di bawah.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop table */}
                                    <div className="hidden md:block">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50">
                                                    <TableHead className="px-5">
                                                        Buyer
                                                    </TableHead>
                                                    <TableHead className="px-5">
                                                        Sanksi
                                                    </TableHead>
                                                    <TableHead className="px-5">
                                                        Status
                                                    </TableHead>
                                                    <TableHead className="px-5">
                                                        Mulai
                                                    </TableHead>
                                                    <TableHead className="px-5">
                                                        Berakhir
                                                    </TableHead>
                                                    <TableHead className="px-5">
                                                        Oleh
                                                    </TableHead>
                                                    <TableHead className="px-5 text-right">
                                                        Aksi
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {sanctions.data.map(
                                                    (sanction) => (
                                                        <TableRow
                                                            key={sanction.id}
                                                            className="group"
                                                        >
                                                            <TableCell className="px-5">
                                                                <div className="font-medium text-slate-900">
                                                                    {
                                                                        sanction
                                                                            .buyer
                                                                            .name
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-slate-500">
                                                                    {
                                                                        sanction
                                                                            .buyer
                                                                            .email
                                                                    }
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-5">
                                                                <Badge
                                                                    className={cn(
                                                                        'rounded-[6px] border-0 font-medium',
                                                                        sanctionBadgeClass(
                                                                            sanction
                                                                                .type
                                                                                .code,
                                                                        ),
                                                                    )}
                                                                >
                                                                    {
                                                                        sanction
                                                                            .type
                                                                            .label
                                                                    }
                                                                </Badge>
                                                                {sanction.reason && (
                                                                    <div
                                                                        className="mt-1.5 max-w-[22rem] truncate text-xs leading-5 text-slate-500"
                                                                        title={
                                                                            sanction.reason
                                                                        }
                                                                    >
                                                                        {
                                                                            sanction.reason
                                                                        }
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="px-5">
                                                                {sanction.status
                                                                    .code ===
                                                                'active' ? (
                                                                    <Badge
                                                                        className={cn(
                                                                            'rounded-[6px] border-0 font-medium',
                                                                            sanction.is_expired
                                                                                ? 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                                                                                : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
                                                                        )}
                                                                    >
                                                                        <span
                                                                            className={cn(
                                                                                'size-1.5 rounded-full',
                                                                                sanction.is_expired
                                                                                    ? 'bg-slate-400'
                                                                                    : 'bg-emerald-500',
                                                                            )}
                                                                        />
                                                                        {sanction.is_expired
                                                                            ? 'Kedaluwarsa'
                                                                            : sanction
                                                                                  .status
                                                                                  .label}
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge className="rounded-[6px] bg-slate-100 text-slate-500 ring-1 ring-slate-200">
                                                                        {
                                                                            sanction
                                                                                .status
                                                                                .label
                                                                        }
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="whitespace-nowrap px-5 text-sm text-slate-600">
                                                                {formatDate(
                                                                    sanction.starts_at,
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="whitespace-nowrap px-5 text-sm text-slate-600">
                                                                {sanction.ends_at
                                                                    ? formatDate(
                                                                          sanction.ends_at,
                                                                      )
                                                                    : 'Sebelum dicabut'}
                                                            </TableCell>
                                                            <TableCell className="px-5 text-sm text-slate-600">
                                                                {
                                                                    sanction.issued_by
                                                                }
                                                            </TableCell>
                                                            <TableCell className="px-5 text-right">
                                                                {sanction.can_lift ? (
                                                                    <Form
                                                                        action={`/admin/sanctions/${sanction.id}/lift`}
                                                                        method="post"
                                                                        disableWhileProcessing
                                                                    >
                                                                        {({
                                                                            processing,
                                                                        }) => (
                                                                            <Button
                                                                                type="submit"
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-8 rounded-[8px] border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                                                                disabled={
                                                                                    processing
                                                                                }
                                                                            >
                                                                                {processing ? (
                                                                                    <Spinner className="size-3.5" />
                                                                                ) : (
                                                                                    <RotateCcw className="size-3.5" />
                                                                                )}
                                                                                Cabut
                                                                            </Button>
                                                                        )}
                                                                    </Form>
                                                                ) : (
                                                                    <span className="text-xs text-slate-400">
                                                                        —
                                                                    </span>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Mobile card list */}
                                    <div className="grid gap-3 bg-slate-50 p-4 md:hidden">
                                        {sanctions.data.map((sanction) => (
                                            <div
                                                key={`m-${sanction.id}`}
                                                className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:shadow-md"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div className="truncate text-sm font-semibold text-slate-900">
                                                            {sanction.buyer.name}
                                                        </div>
                                                        <div className="truncate text-xs text-slate-500">
                                                            {sanction.buyer.email}
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        className={cn(
                                                            'shrink-0 rounded-[6px] border-0 text-xs',
                                                            sanctionBadgeClass(
                                                                sanction.type
                                                                    .code,
                                                            ),
                                                        )}
                                                    >
                                                        {sanction.type.label}
                                                    </Badge>
                                                </div>
                                                {sanction.reason && (
                                                    <p className="mt-3 line-clamp-2 rounded-[8px] bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600 ring-1 ring-slate-200">
                                                        {sanction.reason}
                                                    </p>
                                                )}
                                                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                                                    <div className="space-y-1">
                                                        <div className="font-medium text-slate-500">
                                                            Status
                                                        </div>
                                                        <div>
                                                            {sanction.status
                                                                .code ===
                                                            'active' ? (
                                                                <span
                                                                    className={cn(
                                                                        'inline-flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-xs font-medium ring-1',
                                                                        sanction.is_expired
                                                                            ? 'bg-slate-100 text-slate-500 ring-slate-200'
                                                                            : 'bg-emerald-50 text-emerald-700 ring-emerald-200',
                                                                    )}
                                                                >
                                                                    <span
                                                                        className={cn(
                                                                            'size-1.5 rounded-full',
                                                                            sanction.is_expired
                                                                                ? 'bg-slate-400'
                                                                                : 'bg-emerald-500',
                                                                        )}
                                                                    />
                                                                    {sanction.is_expired
                                                                        ? 'Kedaluwarsa'
                                                                        : sanction
                                                                              .status
                                                                              .label}
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex rounded-[6px] bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                                                                    {
                                                                        sanction
                                                                            .status
                                                                            .label
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="font-medium text-slate-500">
                                                            Oleh
                                                        </div>
                                                        <div className="truncate text-slate-700">
                                                            {sanction.issued_by}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="font-medium text-slate-500">
                                                            Mulai
                                                        </div>
                                                        <div className="text-slate-700">
                                                            {formatDate(
                                                                sanction.starts_at,
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="font-medium text-slate-500">
                                                            Berakhir
                                                        </div>
                                                        <div className="text-slate-700">
                                                            {sanction.ends_at
                                                                ? formatDate(
                                                                      sanction.ends_at,
                                                                  )
                                                                : 'Sebelum dicabut'}
                                                        </div>
                                                    </div>
                                                </div>
                                                {sanction.can_lift && (
                                                    <Form
                                                        action={`/admin/sanctions/${sanction.id}/lift`}
                                                        method="post"
                                                        disableWhileProcessing
                                                        className="mt-4"
                                                    >
                                                        {({ processing }) => (
                                                            <Button
                                                                type="submit"
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-9 w-full rounded-[8px] border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                                                disabled={
                                                                    processing
                                                                }
                                                            >
                                                                {processing ? (
                                                                    <Spinner />
                                                                ) : (
                                                                    <RotateCcw className="size-4" />
                                                                )}
                                                                Cabut Sanksi
                                                            </Button>
                                                        )}
                                                    </Form>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            {sanctions.data.length > 0 && (
                                <PaginationBar paginator={sanctions} />
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <Card className="gap-0 overflow-hidden rounded-[8px] border border-slate-100 bg-white py-0 shadow-sm">
                            <CardHeader className="border-b border-slate-100 p-6">
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-950">
                                    <span className="flex size-8 items-center justify-center rounded-[8px] bg-blue-50 text-blue-600 ring-1 ring-blue-200">
                                        <ShieldAlert className="size-4" />
                                    </span>
                                    Beri Sanksi Manual
                                </CardTitle>
                                <CardDescription>
                                    Blokir checkout, ulasan, atau blokir
                                    permanen untuk buyer tertentu. Gunakan
                                    pencarian untuk menemukan buyer dengan
                                    cepat.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Form
                                    action="/admin/sanctions"
                                    method="post"
                                    disableWhileProcessing
                                >
                                    {({ processing, errors }) => (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="buyer-combobox"
                                                    className="text-slate-700"
                                                >
                                                    Buyer{' '}
                                                    <span className="font-normal text-rose-600">
                                                        *
                                                    </span>
                                                </Label>
                                                <Combobox
                                                    value={
                                                        selectedBuyerId || null
                                                    }
                                                    onValueChange={(
                                                        val: string | null,
                                                    ) => {
                                                        const v = val ?? '';
                                                        setSelectedBuyerId(v);
                                                        const b = buyers.find(
                                                            (x) =>
                                                                String(x.id) ===
                                                                v,
                                                        );
                                                        if (b)
                                                            setBuyerQuery(
                                                                `${b.name} (${b.email})`,
                                                            );
                                                        else if (!v)
                                                            setBuyerQuery('');
                                                    }}
                                                    inputValue={buyerQuery}
                                                    onInputValueChange={(
                                                        v: string,
                                                    ) => {
                                                        setBuyerQuery(v);
                                                        if (selectedBuyerId) {
                                                            const sel =
                                                                buyers.find(
                                                                    (x) =>
                                                                        String(
                                                                            x.id,
                                                                        ) ===
                                                                        selectedBuyerId,
                                                                );
                                                            const label = sel
                                                                ? `${sel.name} (${sel.email})`
                                                                : '';
                                                            if (v !== label)
                                                                setSelectedBuyerId(
                                                                    '',
                                                                );
                                                        }
                                                    }}
                                                >
                                                    <ComboboxInput
                                                        id="buyer-combobox"
                                                        placeholder={
                                                            buyers.length === 0
                                                                ? 'Tidak ada buyer'
                                                                : 'Cari nama atau email buyer…'
                                                        }
                                                        aria-invalid={Boolean(
                                                            errors.user_id,
                                                        )}
                                                        aria-describedby={
                                                            errors.user_id
                                                                ? 'buyer-error'
                                                                : undefined
                                                        }
                                                        disabled={
                                                            buyers.length === 0
                                                        }
                                                        showClear={
                                                            Boolean(
                                                                selectedBuyerId ||
                                                                    buyerQuery,
                                                            )
                                                        }
                                                    />
                                                    <ComboboxContent>
                                                        <ComboboxList>
                                                            {filteredBuyers.length ===
                                                            0 ? (
                                                                <div className="px-3 py-6 text-center">
                                                                    <div className="mx-auto flex size-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 ring-1 ring-slate-200">
                                                                        <SearchX className="size-4" />
                                                                    </div>
                                                                    <p className="mt-2 text-sm font-medium text-slate-700">
                                                                        Buyer
                                                                        tidak
                                                                        ditemukan
                                                                    </p>
                                                                    {buyerQuery && (
                                                                        <p className="mt-1 text-xs text-slate-500">
                                                                            Tidak
                                                                            ada
                                                                            hasil
                                                                            untuk
                                                                            “
                                                                            {
                                                                                buyerQuery
                                                                            }
                                                                            ”
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                filteredBuyers.map(
                                                                    (
                                                                        buyer,
                                                                    ) => (
                                                                        <ComboboxItem
                                                                            key={
                                                                                buyer.id
                                                                            }
                                                                            value={String(
                                                                                buyer.id,
                                                                            )}
                                                                        >
                                                                            <span className="flex min-w-0 flex-col text-left">
                                                                                <span className="truncate text-sm font-medium text-slate-900">
                                                                                    {
                                                                                        buyer.name
                                                                                    }
                                                                                </span>
                                                                                <span className="truncate text-xs text-slate-500">
                                                                                    {
                                                                                        buyer.email
                                                                                    }
                                                                                </span>
                                                                            </span>
                                                                        </ComboboxItem>
                                                                    ),
                                                                )
                                                            )}
                                                        </ComboboxList>
                                                        <ComboboxEmpty className="px-3 py-8 text-center text-sm text-slate-500">
                                                            Buyer tidak
                                                            ditemukan.
                                                        </ComboboxEmpty>
                                                    </ComboboxContent>
                                                </Combobox>
                                                <input
                                                    type="hidden"
                                                    name="user_id"
                                                    value={selectedBuyerId}
                                                />
                                                <InputError
                                                    message={errors.user_id}
                                                />
                                                <p className="text-xs leading-5 text-slate-500">
                                                    {buyers.length} buyer
                                                    tersedia • ketik untuk
                                                    menyaring, pilih untuk
                                                    mengisi. Tombol “Beri
                                                    Sanksi” aktif setelah buyer
                                                    dipilih.
                                                </p>
                                                {selectedBuyer && (
                                                    <div className="flex items-center gap-2 rounded-[8px] border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                                                        <span className="inline-flex size-6 items-center justify-center rounded-full bg-white text-blue-600 ring-1 ring-blue-200">
                                                            {selectedBuyer.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </span>
                                                        <span className="min-w-0">
                                                            <span className="font-medium">
                                                                {
                                                                    selectedBuyer.name
                                                                }
                                                            </span>{' '}
                                                            <span className="text-blue-700/70">
                                                                (
                                                                {
                                                                    selectedBuyer.email
                                                                }
                                                                )
                                                            </span>{' '}
                                                            terpilih
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="type"
                                                    className="text-slate-700"
                                                >
                                                    Jenis Sanksi{' '}
                                                    <span className="font-normal text-rose-600">
                                                        *
                                                    </span>
                                                </Label>
                                                <Select name="type" required>
                                                    <SelectTrigger
                                                        id="type"
                                                        className="w-full rounded-[8px] border-slate-200 bg-white"
                                                        aria-invalid={Boolean(
                                                            errors.type,
                                                        )}
                                                    >
                                                        <SelectValue placeholder="Pilih jenis sanksi" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="checkout_ban">
                                                            Blokir Checkout —
                                                            buyer tidak bisa
                                                            checkout
                                                        </SelectItem>
                                                        <SelectItem value="review_ban">
                                                            Blokir Ulasan — buyer
                                                            tidak bisa memberi
                                                            ulasan
                                                        </SelectItem>
                                                        <SelectItem value="permanent_ban">
                                                            Blokir Permanen
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <InputError
                                                    message={errors.type}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="ends_at"
                                                    className="text-slate-700"
                                                >
                                                    Berakhir Pada{' '}
                                                    <span className="font-normal text-slate-500">
                                                        (opsional)
                                                    </span>
                                                </Label>
                                                <Input
                                                    id="ends_at"
                                                    name="ends_at"
                                                    type="datetime-local"
                                                    className="rounded-[8px] border-slate-200 bg-white"
                                                    aria-invalid={Boolean(
                                                        errors.ends_at,
                                                    )}
                                                />
                                                <InputError
                                                    message={errors.ends_at}
                                                />
                                                <p className="text-xs text-slate-500">
                                                    Kosongkan untuk sanksi
                                                    sampai dicabut manual.
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="reason"
                                                    className="text-slate-700"
                                                >
                                                    Alasan{' '}
                                                    <span className="font-normal text-slate-500">
                                                        (opsional)
                                                    </span>
                                                </Label>
                                                <Textarea
                                                    id="reason"
                                                    name="reason"
                                                    rows={3}
                                                    placeholder="Jelaskan alasan pemberian sanksi agar buyer memahami konteksnya…"
                                                    className="min-h-20 resize-none rounded-[8px] border-slate-200 bg-white"
                                                    aria-invalid={Boolean(
                                                        errors.reason,
                                                    )}
                                                />
                                                <InputError
                                                    message={errors.reason}
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                className="h-11 w-full rounded-[8px] bg-rose-600 px-5 font-semibold text-white shadow-sm transition hover:bg-rose-700 focus-visible:ring-rose-500/20 disabled:opacity-50 sm:w-auto"
                                                disabled={
                                                    processing ||
                                                    !selectedBuyerId ||
                                                    buyers.length === 0
                                                }
                                                title={
                                                    !selectedBuyerId
                                                        ? 'Pilih buyer terlebih dahulu'
                                                        : undefined
                                                }
                                            >
                                                {processing ? (
                                                    <Spinner className="text-white" />
                                                ) : (
                                                    <Ban className="size-4" />
                                                )}
                                                Beri Sanksi
                                            </Button>
                                            {!selectedBuyerId && (
                                                <p className="text-xs text-amber-700">
                                                    Pilih buyer lewat pencarian
                                                    di atas untuk mengaktifkan
                                                    tombol.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </Form>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card className="gap-0 overflow-hidden rounded-[8px] border border-slate-100 bg-white py-0 shadow-sm">
                                <CardHeader className="border-b border-slate-100 p-6">
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-950">
                                        <span className="flex size-8 items-center justify-center rounded-[8px] bg-slate-900 text-white">
                                            <Settings2 className="size-4" />
                                        </span>
                                        Ambang Peringatan Otomatis
                                    </CardTitle>
                                    <CardDescription>
                                        Peringatan dikirim otomatis saat ambang
                                        tercapai dalam periode window. Atur
                                        sesuai kebijakan operasional.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <Form
                                        action="/admin/sanctions/settings"
                                        method="put"
                                        disableWhileProcessing
                                    >
                                        {({ processing, errors }) => (
                                            <div className="space-y-4">
                                                <div className="grid gap-4 sm:grid-cols-3">
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="window_days"
                                                            className="text-slate-700"
                                                        >
                                                            Window (hari)
                                                        </Label>
                                                        <Input
                                                            id="window_days"
                                                            name="window_days"
                                                            type="number"
                                                            min={1}
                                                            max={365}
                                                            defaultValue={
                                                                settings.window_days
                                                            }
                                                            key={`wd-${settings.window_days}`}
                                                            required
                                                            className="rounded-[8px] border-slate-200 bg-white"
                                                            aria-invalid={Boolean(
                                                                errors.window_days,
                                                            )}
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.window_days
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="warning_points"
                                                            className="text-slate-700"
                                                        >
                                                            Poin Warning
                                                        </Label>
                                                        <Input
                                                            id="warning_points"
                                                            name="warning_points"
                                                            type="number"
                                                            min={1}
                                                            max={100}
                                                            defaultValue={
                                                                settings.warning_points
                                                            }
                                                            key={`wp-${settings.warning_points}`}
                                                            required
                                                            className="rounded-[8px] border-slate-200 bg-white"
                                                            aria-invalid={Boolean(
                                                                errors.warning_points,
                                                            )}
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.warning_points
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="receipt_force_complete_count"
                                                            className="text-slate-700"
                                                        >
                                                            Force-complete ×
                                                        </Label>
                                                        <Input
                                                            id="receipt_force_complete_count"
                                                            name="receipt_force_complete_count"
                                                            type="number"
                                                            min={2}
                                                            max={100}
                                                            defaultValue={
                                                                settings.receipt_force_complete_count
                                                            }
                                                            key={`rf-${settings.receipt_force_complete_count}`}
                                                            required
                                                            className="rounded-[8px] border-slate-200 bg-white"
                                                            aria-invalid={Boolean(
                                                                errors.receipt_force_complete_count,
                                                            )}
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.receipt_force_complete_count
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-3">
                                                    <div className="text-xs font-medium text-slate-700">
                                                        Bobot poin pelanggaran
                                                    </div>
                                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                                        {violation_types.map(
                                                            (t) => (
                                                                <Badge
                                                                    key={t.code}
                                                                    className="rounded-[6px] border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700"
                                                                >
                                                                    {t.label}{' '}
                                                                    <span className="ml-1 rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
                                                                        +
                                                                        {
                                                                            t.points
                                                                        }
                                                                    </span>
                                                                </Badge>
                                                            ),
                                                        )}
                                                    </div>
                                                    <p className="mt-2 text-xs leading-5 text-slate-500">
                                                        Periode window menghitung
                                                        akumulasi poin dalam{' '}
                                                        <span className="font-medium text-slate-700">
                                                            {
                                                                settings.window_days
                                                            }{' '}
                                                            hari
                                                        </span>{' '}
                                                        terakhir. Warning dipicu
                                                        saat mencapai{' '}
                                                        <span className="font-medium text-slate-700">
                                                            {
                                                                settings.warning_points
                                                            }{' '}
                                                            poin
                                                        </span>
                                                        .
                                                    </p>
                                                </div>

                                                <Button
                                                    type="submit"
                                                    className="h-11 w-full rounded-[8px] bg-[#0080FF] px-5 font-semibold text-white shadow-sm hover:bg-[#006FE0] focus-visible:ring-[#0080FF]/20 disabled:opacity-50 sm:w-auto"
                                                    disabled={processing}
                                                >
                                                    {processing ? (
                                                        <Spinner className="text-white" />
                                                    ) : (
                                                        <Settings2 className="size-4" />
                                                    )}
                                                    Simpan Pengaturan
                                                </Button>
                                            </div>
                                        )}
                                    </Form>
                                </CardContent>
                            </Card>

                            <Card className="overflow-hidden rounded-[8px] border border-blue-100 bg-[#EFF8FF] py-0 shadow-sm">
                                <CardContent className="p-5">
                                    <div className="flex gap-3">
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-white text-[#0080FF] ring-1 ring-[#BCE0FF]">
                                            <AlertTriangle className="size-4" />
                                        </span>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-semibold text-slate-900">
                                                Tips kebijakan
                                            </h4>
                                            <p className="text-xs leading-5 text-slate-600">
                                                Gunakan blokir sementara untuk
                                                pelanggaran ringan dan blokir
                                                permanen hanya untuk kasus
                                                berat. Selalu sertakan alasan
                                                yang jelas agar audit tetap
                                                transparan.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <Card className="gap-0 overflow-hidden rounded-[8px] border border-slate-100 bg-white py-0 shadow-sm">
                        <CardHeader className="border-b border-slate-100 p-6">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-950">
                                        <span className="flex size-8 items-center justify-center rounded-[8px] bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                                            <Clock3 className="size-4" />
                                        </span>
                                        Pelanggaran Terbaru
                                    </CardTitle>
                                    <CardDescription>
                                        Catatan pelanggaran yang terekam otomatis
                                        dari aktivitas buyer — jadi dasar
                                        perhitungan ambang.
                                    </CardDescription>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="w-fit rounded-[6px] bg-slate-50 text-slate-600 ring-1 ring-slate-200"
                                >
                                    {violations.from ?? 0}–
                                    {violations.to ?? 0} dari{' '}
                                    {violations.total ?? 0}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {violations.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                                    <div className="flex size-12 items-center justify-center rounded-[14px] bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                                        <ShieldAlert className="size-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-semibold text-slate-900">
                                            Belum ada pelanggaran tercatat
                                        </h3>
                                        <p className="mx-auto max-w-sm text-sm leading-6 text-slate-500">
                                            Semua aktivitas buyer terpantau
                                            baik. Pelanggaran baru akan muncul
                                            di sini secara otomatis.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="hidden md:block">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50">
                                                    <TableHead className="px-5">
                                                        Buyer
                                                    </TableHead>
                                                    <TableHead className="px-5">
                                                        Pelanggaran
                                                    </TableHead>
                                                    <TableHead className="px-5">
                                                        Poin
                                                    </TableHead>
                                                    <TableHead className="px-5">
                                                        Waktu
                                                    </TableHead>
                                                    <TableHead className="px-5">
                                                        Pesanan
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {violations.data.map(
                                                    (violation) => (
                                                        <TableRow
                                                            key={violation.id}
                                                        >
                                                            <TableCell className="px-5">
                                                                <div className="font-medium text-slate-900">
                                                                    {
                                                                        violation
                                                                            .buyer
                                                                            .name
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-slate-500">
                                                                    {
                                                                        violation
                                                                            .buyer
                                                                            .email
                                                                    }
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="max-w-md px-5">
                                                                <div className="text-sm font-medium text-slate-800">
                                                                    {
                                                                        violation
                                                                            .type
                                                                            .label
                                                                    }
                                                                </div>
                                                                {violation.description && (
                                                                    <div
                                                                        className="truncate text-xs leading-5 text-slate-500"
                                                                        title={
                                                                            violation.description
                                                                        }
                                                                    >
                                                                        {
                                                                            violation.description
                                                                        }
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="px-5">
                                                                <Badge className="rounded-[6px] bg-slate-900 px-2 py-1 text-xs font-bold text-white">
                                                                    +
                                                                    {
                                                                        violation.points
                                                                    }
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="whitespace-nowrap px-5 text-sm text-slate-600">
                                                                {formatDate(
                                                                    violation.occurred_at,
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="px-5 text-sm">
                                                                {violation.order_code ? (
                                                                    <Badge className="rounded-[6px] bg-slate-50 font-mono text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                                                                        {
                                                                            violation.order_code
                                                                        }
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-slate-400">
                                                                        —
                                                                    </span>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <div className="grid gap-3 bg-slate-50 p-4 md:hidden">
                                        {violations.data.map((violation) => (
                                            <div
                                                key={`vm-${violation.id}`}
                                                className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div className="truncate text-sm font-semibold text-slate-900">
                                                            {
                                                                violation.buyer
                                                                    .name
                                                            }
                                                        </div>
                                                        <div className="truncate text-xs text-slate-500">
                                                            {
                                                                violation.buyer
                                                                    .email
                                                            }
                                                        </div>
                                                    </div>
                                                    <Badge className="shrink-0 rounded-[6px] bg-slate-900 px-2 py-1 text-xs font-bold text-white">
                                                        +{violation.points}
                                                    </Badge>
                                                </div>
                                                <div className="mt-3 space-y-1">
                                                    <div className="text-sm font-medium text-slate-800">
                                                        {
                                                            violation.type.label
                                                        }
                                                    </div>
                                                    {violation.description && (
                                                        <p className="line-clamp-2 text-xs leading-5 text-slate-500">
                                                            {
                                                                violation.description
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                                                    <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-slate-50 px-2 py-1 text-slate-600 ring-1 ring-slate-200">
                                                        <Clock3 className="size-3.5" />
                                                        {formatDate(
                                                            violation.occurred_at,
                                                        )}
                                                    </span>
                                                    {violation.order_code ? (
                                                        <span className="inline-flex rounded-[6px] bg-white px-2 py-1 font-mono text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                                                            {
                                                                violation.order_code
                                                            }
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">
                                                            Tanpa pesanan
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            {violations.data.length > 0 && (
                                <PaginationBar paginator={violations} />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    );
}

AdminSanctions.layout = {
    breadcrumbs: [
        {
            title: 'Sanksi Buyer',
            href: '/admin/sanctions',
        },
    ],
};
