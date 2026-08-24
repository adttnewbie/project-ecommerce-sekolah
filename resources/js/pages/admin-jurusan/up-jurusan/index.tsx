import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    Package,
    ShieldCheck,
    Sparkles,
    Users,
    Warehouse,
} from 'lucide-react';
import InputError from '@/components/input-error';
import { EmptyState } from '@/components/admin-jurusan/empty-state';
import { PageHeader } from '@/components/admin-jurusan/page-header';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    upJurusans: {
        id: number;
        name: string;
        description: string | null;
        picket_officers: {
            id: number;
            name: string;
            email: string;
            up_jurusan_id: number | null;
        }[];
        products: {
            id: number;
            name: string;
            category_name: string;
            price: number;
            stock: number;
            status: { code: string; label: string };
        }[];
        revenue_chart: { day: string; revenue: number }[];
        summary: {
            revenue_7_days: number;
            up_product_count: number;
            active_consignment_count: number;
            available_stock: number;
            picket_names: string[];
        };
    }[];
    picketOptions: {
        id: number;
        name: string;
        email: string;
        up_jurusan_id: number | null;
    }[];
    categories: { id: number; name: string }[];
};

export default function AdminJurusanUpJurusan({ upJurusans }: Props) {
    const { flash } = usePage().props as unknown as {
        flash: { success?: string; error?: string };
    };
    const hasUpJurusan = upJurusans.length > 0;

    return (
        <>
            <Head title="UP Jurusan" />
            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    badge="Master UP"
                    badgeIcon={Warehouse}
                    title="UP Jurusan"
                    description="Kelola unit produksi jurusan. Klik kartu untuk lihat detail omzet, picket, dan produk."
                    actions={
                        hasUpJurusan ? (
                            <Badge className="rounded-md bg-emerald-50 text-emerald-700">
                                <BadgeCheck className="size-3.5" />
                                {upJurusans.length} UP Aktif
                            </Badge>
                        ) : undefined
                    }
                />

                {flash.success && (
                    <Alert className="rounded-xl border-emerald-200 bg-emerald-50 text-emerald-800">
                        <Sparkles className="size-4" />
                        <AlertTitle>Berhasil</AlertTitle>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}
                {flash.error && (
                    <Alert variant="destructive" className="rounded-xl">
                        <AlertTitle>Gagal</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                {hasUpJurusan ? (
                    <Alert className="rounded-xl border-blue-100 bg-blue-50 text-blue-800">
                        <ShieldCheck className="size-4" />
                        <AlertTitle>UP sudah aktif</AlertTitle>
                        <AlertDescription className="text-blue-700">
                            Klik kartu UP di bawah untuk kelola produk &
                            picket di halaman detail.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Card className="rounded-xl border-slate-200 shadow-sm">
                        <CardHeader className="border-b border-slate-100">
                            <CardTitle className="flex items-center gap-2">
                                <Warehouse className="size-5 text-blue-600" />
                                Buat UP Jurusan Pertama
                            </CardTitle>
                            <CardDescription>
                                Nama UP akan jadi brand di katalog & POS.
                                Contoh: UP RPL, UP TKJ, Kantin Jurusan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5">
                            <Form
                                action="/admin-jurusan/up-jurusan"
                                method="post"
                                disableWhileProcessing
                                className="grid gap-3 md:grid-cols-[1fr_1.5fr_auto]"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-700">
                                                Nama UP *
                                            </Label>
                                            <Input
                                                name="name"
                                                placeholder="Contoh: UP RPL"
                                                required
                                                className="rounded-lg"
                                                aria-invalid={Boolean(
                                                    errors.name,
                                                )}
                                            />
                                            <InputError message={errors.name} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-700">
                                                Deskripsi singkat
                                            </Label>
                                            <Input
                                                name="description"
                                                placeholder="Contoh: Unit produksi jurusan Rekayasa Perangkat Lunak"
                                                className="rounded-lg"
                                                aria-invalid={Boolean(
                                                    errors.description,
                                                )}
                                            />
                                            <InputError
                                                message={errors.description}
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="w-full rounded-lg md:w-auto"
                                            >
                                                {processing
                                                    ? 'Membuat...'
                                                    : 'Buat UP'}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>
                )}

                <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
                    <CardContent className="p-0">
                        {upJurusans.length === 0 ? (
                            <EmptyState
                                icon={Warehouse}
                                title="Belum ada UP Jurusan"
                                description="Buat UP pertama untuk mulai kelola produk dan picket. Setelah UP jadi, klik kartu untuk lihat detail omzet dan produk."
                            />
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {upJurusans.map((up) => {
                                    const hasPicket =
                                        up.picket_officers.length > 0;
                                    return (
                                        <Link
                                            key={up.id}
                                            href={`/admin-jurusan/up-jurusan/${up.id}`}
                                            className="group block p-5 transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none sm:p-6"
                                        >
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
                                                                <Warehouse className="size-5" />
                                                            </span>
                                                            <h3 className="truncate text-base font-semibold text-slate-900 group-hover:text-blue-700">
                                                                {up.name}
                                                            </h3>
                                                        </div>
                                                        <Badge className="rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                                                            Aktif
                                                        </Badge>
                                                        <Badge
                                                            variant="outline"
                                                            className="rounded-md"
                                                        >
                                                            <Package className="size-3.5" />
                                                            {
                                                                up.products
                                                                    .length
                                                            }{' '}
                                                            produk
                                                        </Badge>
                                                        <Badge
                                                            variant="secondary"
                                                            className={`rounded-md ${hasPicket ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
                                                        >
                                                            <Users className="size-3.5" />
                                                            {hasPicket
                                                                ? up
                                                                      .picket_officers[0]
                                                                      .name
                                                                : 'Belum ada picket'}
                                                        </Badge>
                                                    </div>
                                                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                                                        {up.description ||
                                                            'Tidak ada deskripsi'}
                                                    </p>
                                                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                                                            Omzet 7h:{' '}
                                                            {new Intl.NumberFormat(
                                                                'id-ID',
                                                                {
                                                                    style: 'currency',
                                                                    currency:
                                                                        'IDR',
                                                                    maximumFractionDigits: 0,
                                                                },
                                                            ).format(
                                                                up.summary
                                                                    .revenue_7_days,
                                                            )}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                                                            Stok:{' '}
                                                            {
                                                                up.summary
                                                                    .available_stock
                                                            }
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                                                            Titipan:{' '}
                                                            {
                                                                up.summary
                                                                    .active_consignment_count
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-blue-600 group-hover:gap-2">
                                                    Lihat Detail
                                                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminJurusanUpJurusan.layout = {
    breadcrumbs: [{ title: 'UP Jurusan', href: '/admin-jurusan/up-jurusan' }],
};
