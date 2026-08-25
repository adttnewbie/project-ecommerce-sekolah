import { Form, Head } from '@inertiajs/react';
import {
    AlertTriangle,
    Ban,
    Gavel,
    RotateCcw,
    Settings2,
    ShieldAlert,
} from 'lucide-react';
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

type Props = {
    sanctions: { data: SanctionRow[] };
    violations: { data: ViolationRow[] };
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
            return 'bg-amber-50 text-amber-700';
        case 'checkout_ban':
            return 'bg-orange-50 text-orange-700';
        case 'review_ban':
            return 'bg-violet-50 text-violet-700';
        default:
            return 'bg-rose-50 text-rose-700';
    }
};

export default function AdminSanctions({
    sanctions,
    violations,
    buyers,
    settings,
    violation_types,
}: Props) {
    return (
        <>
            <Head title="Sanksi Buyer" />
            <main className="min-h-[calc(100svh-4rem)] bg-slate-50 p-4 sm:p-6">
                <div className="space-y-6">
                    <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <Badge className="rounded-[6px] bg-blue-50 text-blue-700">
                                    <ShieldAlert className="size-3.5" />
                                    Admin Center
                                </Badge>
                                <Badge className="rounded-[6px] bg-amber-50 text-amber-700">
                                    <Gavel className="size-3.5" />
                                    {violations.data.length} pelanggaran
                                    terbaru
                                </Badge>
                            </div>
                            <h1 className="text-2xl font-semibold text-slate-950">
                                Sanksi Buyer
                            </h1>
                            <p className="mt-1 max-w-2xl text-sm text-slate-500">
                                Pantau pelanggaran buyer, berikan sanksi, dan
                                atur ambang peringatan otomatis.
                            </p>
                        </div>
                    </section>

                    <Card className="gap-0 rounded-[8px] border border-slate-100 bg-white py-0 shadow-sm">
                        <CardHeader className="border-b border-slate-100 p-6">
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                                <Ban className="size-5" />
                                Daftar Sanksi
                            </CardTitle>
                            <CardDescription>
                                Peringatan diberikan otomatis oleh sistem saat
                                ambang tercapai. Ban dapat dicabut kapan saja.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {sanctions.data.length === 0 ? (
                                <div className="p-8 text-center text-sm text-slate-500">
                                    Belum ada sanksi.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Buyer</TableHead>
                                            <TableHead>Sanksi</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Mulai</TableHead>
                                            <TableHead>Berakhir</TableHead>
                                            <TableHead>Oleh</TableHead>
                                            <TableHead className="text-right">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sanctions.data.map((sanction) => (
                                            <TableRow key={sanction.id}>
                                                <TableCell>
                                                    <div className="font-medium text-slate-900">
                                                        {sanction.buyer.name}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {sanction.buyer.email}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={`rounded-[6px] ${sanctionBadgeClass(sanction.type.code)}`}
                                                    >
                                                        {sanction.type.label}
                                                    </Badge>
                                                    {sanction.reason && (
                                                        <div className="mt-1 max-w-xs truncate text-xs text-slate-500">
                                                            {sanction.reason}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {sanction.status.code ===
                                                    'active' ? (
                                                        <span
                                                            className={
                                                                sanction.is_expired
                                                                    ? 'text-slate-400'
                                                                    : 'font-medium text-emerald-600'
                                                            }
                                                        >
                                                            {sanction.is_expired
                                                                ? 'Kedaluwarsa'
                                                                : sanction.status.label}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">
                                                            {sanction.status.label}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap text-sm">
                                                    {formatDate(
                                                        sanction.starts_at,
                                                    )}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap text-sm">
                                                    {sanction.ends_at
                                                        ? formatDate(
                                                              sanction.ends_at,
                                                          )
                                                        : 'Sebelum dicabut'}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {sanction.issued_by}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {sanction.can_lift && (
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
                                                                    className="rounded-[8px] border-slate-200 text-slate-600 hover:bg-slate-50"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                >
                                                                    {processing ? (
                                                                        <Spinner />
                                                                    ) : (
                                                                        <RotateCcw className="size-3.5" />
                                                                    )}
                                                                    Cabut
                                                                </Button>
                                                            )}
                                                        </Form>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <Card className="gap-0 rounded-[8px] border border-slate-100 bg-white py-0 shadow-sm">
                            <CardHeader className="border-b border-slate-100 p-6">
                                <CardTitle className="text-lg font-semibold text-slate-950">
                                    Beri Sanksi Manual
                                </CardTitle>
                                <CardDescription>
                                    Blokir checkout, ulasan, atau blokir
                                    permanen untuk buyer tertentu.
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
                                                <Label htmlFor="user_id">
                                                    Buyer
                                                </Label>
                                                <Select
                                                    name="user_id"
                                                    required
                                                >
                                                    <SelectTrigger
                                                        id="user_id"
                                                        className="w-full rounded-[8px]"
                                                    >
                                                        <SelectValue placeholder="Pilih buyer" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {buyers.map(
                                                            (buyer) => (
                                                                <SelectItem
                                                                    key={
                                                                        buyer.id
                                                                    }
                                                                    value={String(
                                                                        buyer.id,
                                                                    )}
                                                                >
                                                                    {
                                                                        buyer.name
                                                                    }{' '}
                                                                    (
                                                                    {
                                                                        buyer.email
                                                                    }
                                                                    )
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <InputError
                                                    message={errors.user_id}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="type">
                                                    Jenis Sanksi
                                                </Label>
                                                <Select name="type" required>
                                                    <SelectTrigger
                                                        id="type"
                                                        className="w-full rounded-[8px]"
                                                    >
                                                        <SelectValue placeholder="Pilih jenis sanksi" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="checkout_ban">
                                                            Blokir Checkout
                                                        </SelectItem>
                                                        <SelectItem value="review_ban">
                                                            Blokir Ulasan
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
                                                <Label htmlFor="ends_at">
                                                    Berakhir Pada (opsional)
                                                </Label>
                                                <Input
                                                    id="ends_at"
                                                    name="ends_at"
                                                    type="datetime-local"
                                                    className="rounded-[8px]"
                                                />
                                                <InputError
                                                    message={errors.ends_at}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="reason">
                                                    Alasan (opsional)
                                                </Label>
                                                <Textarea
                                                    id="reason"
                                                    name="reason"
                                                    rows={3}
                                                    placeholder="Alasan pemberian sanksi"
                                                    className="min-h-20 rounded-[8px]"
                                                />
                                                <InputError
                                                    message={errors.reason}
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                className="rounded-[8px] bg-rose-600 text-white hover:bg-rose-700"
                                                disabled={processing}
                                            >
                                                {processing ? (
                                                    <Spinner />
                                                ) : (
                                                    <Ban className="size-4" />
                                                )}
                                                Beri Sanksi
                                            </Button>
                                        </div>
                                    )}
                                </Form>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card className="gap-0 rounded-[8px] border border-slate-100 bg-white py-0 shadow-sm">
                                <CardHeader className="border-b border-slate-100 p-6">
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                                        <Settings2 className="size-5" />
                                        Ambang Peringatan Otomatis
                                    </CardTitle>
                                    <CardDescription>
                                        Peringatan dikirim otomatis saat ambang
                                        tercapai dalam periode window.
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
                                                        <Label htmlFor="window_days">
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
                                                            className="rounded-[8px]"
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.window_days
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="warning_points">
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
                                                            className="rounded-[8px]"
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.warning_points
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="receipt_force_complete_count">
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
                                                            className="rounded-[8px]"
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.receipt_force_complete_count
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                <div className="rounded-[8px] bg-slate-50 p-3 text-xs text-slate-500">
                                                    Bobot poin pelanggaran:{' '}
                                                    {violation_types
                                                        .map(
                                                            (t) =>
                                                                `${t.label} (${t.points})`,
                                                        )
                                                        .join(', ')}.
                                                </div>

                                                <Button
                                                    type="submit"
                                                    className="rounded-[8px] bg-blue-600 text-white hover:bg-blue-700"
                                                    disabled={processing}
                                                >
                                                    {processing ? (
                                                        <Spinner />
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
                        </div>
                    </div>

                    <Card className="gap-0 rounded-[8px] border border-slate-100 bg-white py-0 shadow-sm">
                        <CardHeader className="border-b border-slate-100 p-6">
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                                <AlertTriangle className="size-5" />
                                Pelanggaran Terbaru
                            </CardTitle>
                            <CardDescription>
                                Catatan pelanggaran yang terekam otomatis dari
                                aktivitas buyer.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {violations.data.length === 0 ? (
                                <div className="p-8 text-center text-sm text-slate-500">
                                    Belum ada pelanggaran tercatat.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Buyer</TableHead>
                                            <TableHead>Pelanggaran</TableHead>
                                            <TableHead>Poin</TableHead>
                                            <TableHead>Waktu</TableHead>
                                            <TableHead>Pesanan</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {violations.data.map((violation) => (
                                            <TableRow
                                                key={violation.id}
                                                className="hover:bg-transparent"
                                            >
                                                <TableCell>
                                                    <div className="font-medium text-slate-900">
                                                        {violation.buyer.name}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {violation.buyer.email}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-slate-800">
                                                        {violation.type.label}
                                                    </div>
                                                    {violation.description && (
                                                        <div className="max-w-md truncate text-xs text-slate-500">
                                                            {
                                                                violation.description
                                                            }
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="rounded-[6px] bg-slate-100 text-slate-700">
                                                        +{violation.points}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap text-sm">
                                                    {formatDate(
                                                        violation.occurred_at,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {violation.order_code ?? '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
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
