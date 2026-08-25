import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    FileText,
    Info,
    LayoutDashboard,
    MessageSquare,
    Phone,
    ShieldCheck,
    Sparkles,
    Store,
    UserRound,
    XCircle,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

type SellerApplication = {
    id: number;
    store_name: string;
    phone: string;
    product_plan: string;
    reason: string | null;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason: string | null;
    created_at: string | null;
    reviewed_at: string | null;
};

type Props = {
    application: SellerApplication | null;
};

const statusMeta = {
    pending: {
        label: 'Menunggu review',
        icon: Clock3,
        badgeClass: 'bg-[#FFF7ED] text-[#EA580C] ring-1 ring-amber-200',
        cardBorder: 'border-amber-200',
        iconBg: 'bg-amber-50 ring-amber-200 text-amber-600',
    },
    approved: {
        label: 'Disetujui',
        icon: CheckCircle2,
        badgeClass: 'bg-[#ECFDF3] text-[#16A34A] ring-1 ring-emerald-200',
        cardBorder: 'border-emerald-200',
        iconBg: 'bg-emerald-50 ring-emerald-200 text-emerald-600',
    },
    rejected: {
        label: 'Ditolak',
        icon: XCircle,
        badgeClass: 'bg-[#FEF2F2] text-[#DC2626] ring-1 ring-rose-200',
        cardBorder: 'border-rose-200',
        iconBg: 'bg-rose-50 ring-rose-200 text-rose-600',
    },
};

function StepIndicator({ application }: { application: SellerApplication | null }) {
    const activeStep = useMemo(() => {
        if (!application) {
            return 1;
        }

        if (application.status === 'pending') {
            return 2;
        }

        if (application.status === 'approved') {
            return 3;
        }

        // rejected -> kembali ke step 1 untuk ajukan ulang
        return 1;
    }, [application]);

    const steps = [
        { n: 1, title: 'Isi data', desc: 'Lengkapi toko' },
        { n: 2, title: 'Review admin', desc: '1-2 hari' },
        { n: 3, title: 'Jadi seller', desc: 'Kelola produk' },
    ];

    return (
        <div className="rounded-[14px] border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Proses pengajuan</p>
            <ol className="mt-3 flex items-start gap-2">
                {steps.map((s, idx) => {
                    const isActive = s.n === activeStep;
                    const isDone = s.n < activeStep || (application?.status === 'approved' && s.n <= 3);
                    const isPendingStep = application?.status === 'pending' && s.n === 2;

                    return (
                        <li key={s.n} className="flex flex-1 items-start gap-2">
                            <div className="flex flex-col items-center">
                                <span
                                    className={[
                                        'grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ring-1 transition-colors duration-200',
                                        isDone
                                            ? 'bg-[#0080FF] text-white ring-[#0080FF]'
                                            : isActive
                                              ? 'bg-[#EFF8FF] text-[#0080FF] ring-[#BCE0FF]'
                                              : 'bg-slate-50 text-slate-400 ring-slate-200',
                                        isPendingStep ? 'animate-pulse' : '',
                                    ].join(' ')}
                                    aria-current={isActive ? 'step' : undefined}
                                >
                                    {isDone ? <CheckCircle2 className="size-4" /> : s.n}
                                </span>
                                {idx < steps.length - 1 && (
                                    <span
                                        className={[
                                            'mt-2 hidden h-0.5 w-8 rounded-full lg:block xl:w-12',
                                            s.n < activeStep ? 'bg-[#0080FF]' : 'bg-slate-200',
                                        ].join(' ')}
                                        aria-hidden
                                    />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p
                                    className={[
                                        'text-sm font-semibold leading-none',
                                        isActive ? 'text-slate-900' : isDone ? 'text-slate-700' : 'text-slate-500',
                                    ].join(' ')}
                                >
                                    {s.title}
                                </p>
                                <p className="mt-1 text-xs leading-none text-slate-500">{s.desc}</p>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}

function formatDate(iso: string | null) {
    if (!iso) {
        return '-';
    }

    try {
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

export default function SellerApplicationIndex({ application }: Props) {
    const { flash } = usePage().props as unknown as { flash?: { success?: string; error?: string } };
    const canApply = !application || application.status === 'rejected';
    const meta = application ? statusMeta[application.status] : null;
    const StatusIcon = meta?.icon;

    // local char count state (controlled via Form still, but we track for UX)
    const [storeName, setStoreName] = useState('');
    const [phone, setPhone] = useState('');
    const [productPlan, setProductPlan] = useState('');
    const [reason, setReason] = useState('');

    const isApproved = application?.status === 'approved';

    return (
        <>
            <Head title="Ajukan Jadi Seller" />
            <main className="min-h-[calc(100svh-4rem)] bg-[#F8FAFC]">
                <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
                    {/* Breadcrumb */}
                    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm">
                        <Link href="/" className="text-slate-500 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0080FF]/20">
                            Beranda
                        </Link>
                        <span className="text-slate-300">/</span>
                        <Link href="/settings/profile" className="text-slate-500 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0080FF]/20">
                            Pengaturan
                        </Link>
                        <span className="text-slate-300">/</span>
                        <span className="font-medium text-slate-900" aria-current="page">Ajukan Seller</span>
                    </nav>

                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge className="rounded-[6px] bg-[#EFF8FF] px-2.5 py-1 text-xs font-semibold text-[#0080FF] ring-1 ring-[#BCE0FF]">
                                    <Store className="size-3.5" />
                                    Seller EduCart
                                </Badge>
                                {application && meta && (
                                    <Badge className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.badgeClass}`}>
                                        {StatusIcon && <StatusIcon className="size-3" />}
                                        {meta.label}
                                    </Badge>
                                )}
                            </div>
                            <h1 className="mt-3 text-[30px] font-bold leading-none tracking-tight text-slate-900 lg:text-[36px]">Ajukan jadi seller</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-6">
                                Akun buyer tetap aktif. Setelah admin menyetujui pengajuan, akun kamu otomatis berubah menjadi seller
                                dan bisa langsung mengelola produk di dashboard.
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            {isApproved ? (
                                <Button asChild className="h-11 rounded-xl px-5 font-semibold">
                                    <Link href="/seller/dashboard">
                                        <LayoutDashboard className="size-4" />
                                        Buka Seller Dashboard
                                    </Link>
                                </Button>
                            ) : (
                                <Button asChild variant="outline" className="h-11 rounded-xl border-slate-200 bg-white px-5">
                                    <Link href="/settings/profile">
                                        <ArrowLeft className="size-4" />
                                        Kembali ke pengaturan
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    {flash?.success && (
                        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-[#ECFDF3] px-4 py-3 text-sm text-emerald-800 shadow-sm" role="status">
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                            <p className="leading-5">{flash.success}</p>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-[#FEF2F2] px-4 py-3 text-sm text-rose-700 shadow-sm" role="alert">
                            <XCircle className="mt-0.5 size-4 shrink-0 text-rose-600" />
                            <p className="leading-5">{flash.error}</p>
                        </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:items-start">
                        {/* Left */}
                        <div className="space-y-6 lg:sticky lg:top-[88px]">
                            <StepIndicator application={application} />

                            <Card className="rounded-[14px] border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <span className="grid size-8 place-items-center rounded-xl bg-[#EFF8FF] ring-1 ring-[#BCE0FF]">
                                            <Sparkles className="size-4 text-[#0080FF]" />
                                        </span>
                                        Kenapa jualan di EduCart?
                                    </CardTitle>
                                    <CardDescription className="text-sm leading-5">Cocok untuk pelajar & UMKM sekolah</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
                                    <ul className="space-y-3">
                                        <li className="flex gap-3">
                                            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-slate-100 ring-1 ring-slate-200">
                                                <Store className="size-3.5 text-slate-600" />
                                            </span>
                                            <span>
                                                <span className="font-semibold text-slate-900">Toko langsung aktif</span> — tanpa verifikasi ribet, langsung upload produk setelah disetujui.
                                            </span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-slate-100 ring-1 ring-slate-200">
                                                <ShieldCheck className="size-3.5 text-slate-600" />
                                            </span>
                                            <span>
                                                <span className="font-semibold text-slate-900">Transaksi aman</span> — pembayaran diverifikasi picket/admin, dana tercatat jelas.
                                            </span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-slate-100 ring-1 ring-slate-200">
                                                <UserRound className="size-3.5 text-slate-600" />
                                            </span>
                                            <span>
                                                <span className="font-semibold text-slate-900">Jangkauan luas</span> — pembeli dari seluruh warga sekolah.
                                            </span>
                                        </li>
                                    </ul>
                                    <div className="rounded-xl border border-blue-100 bg-[#EFF8FF] p-3">
                                        <p className="flex gap-2 text-xs font-semibold leading-5 text-[#0A3F76]">
                                            <Info className="mt-0.5 size-3.5 shrink-0" />
                                            Tips
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-slate-600">
                                            Tulis rencana produk yang spesifik (contoh: “Snack 2k, alat tulis, sablon kaos kelas”) agar admin lebih cepat menyetujui.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {application && meta && StatusIcon && (
                                <Card className={`rounded-[14px] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] ${meta.cardBorder}`}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                                            <span className={`grid size-8 place-items-center rounded-xl ring-1 ${meta.iconBg}`}>
                                                <StatusIcon className="size-4" />
                                            </span>
                                            Status pengajuan
                                        </CardTitle>
                                        <CardDescription>
                                            Pengajuan terakhir untuk <span className="font-medium text-slate-700">{application.store_name}</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge className={`rounded-[6px] px-2.5 py-1 text-xs font-semibold ${meta.badgeClass}`}>
                                                <StatusIcon className="size-3.5" />
                                                {meta.label}
                                            </Badge>
                                            <span className="text-xs text-slate-500">{formatDate(application.created_at)} · ID #{application.id}</span>
                                        </div>

                                        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                            <div className="flex justify-between gap-4 text-xs">
                                                <span className="text-slate-500">Diajukan</span>
                                                <span className="font-medium text-slate-900">{formatDate(application.created_at)}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between gap-4 text-xs">
                                                <span className="text-slate-500">Direview</span>
                                                <span className="font-medium text-slate-900">{application.reviewed_at ? formatDate(application.reviewed_at) : '—'}</span>
                                            </div>
                                            {isApproved && (
                                                <>
                                                    <Separator />
                                                    <p className="text-xs leading-5 text-emerald-700">
                                                        Selamat! Akun kamu sekarang seller. Buka dashboard untuk mulai tambah produk.
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        {application.status === 'rejected' && application.rejection_reason && (
                                            <div className="rounded-xl border border-rose-200 bg-[#FEF2F2] p-3">
                                                <p className="flex items-center gap-2 text-xs font-semibold text-rose-800">
                                                    <MessageSquare className="size-3.5" />
                                                    Alasan ditolak
                                                </p>
                                                <p className="mt-1 text-sm leading-6 text-rose-700">{application.rejection_reason}</p>
                                            </div>
                                        )}

                                        {application.status === 'pending' && (
                                            <p className="flex gap-2 rounded-xl border border-amber-200 bg-[#FFF7ED] p-3 text-xs leading-5 text-amber-800">
                                                <Clock3 className="mt-0.5 size-3.5 shrink-0" />
                                                Pengajuan kamu sedang diproses. Kamu akan mendapat notifikasi saat admin selesai mereview.
                                            </p>
                                        )}

                                        {isApproved ? (
                                            <Button asChild className="h-11 w-full rounded-xl font-semibold">
                                                <Link href="/seller/dashboard">
                                                    <LayoutDashboard className="size-4" />
                                                    Buka Seller Dashboard
                                                </Link>
                                            </Button>
                                        ) : application.status === 'rejected' ? (
                                            <p className="text-xs leading-5 text-slate-500">
                                                Kamu bisa mengajukan ulang dengan mengisi form di sebelah. Pastikan data lebih lengkap.
                                            </p>
                                        ) : null}
                                    </CardContent>
                                </Card>
                            )}

                            <Card className="rounded-[14px] border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                                <CardHeader>
                                    <CardTitle className="text-base">Butuh bantuan?</CardTitle>
                                    <CardDescription>Hubungi admin jika ada kendala</CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm leading-6 text-slate-600">
                                    <p>Pastikan nomor WhatsApp aktif. Admin mungkin menghubungi untuk verifikasi toko.</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right */}
                        <Card className="rounded-[14px] border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <span className="grid size-8 place-items-center rounded-xl bg-slate-900 text-white">
                                        <FileText className="size-4" />
                                    </span>
                                    Data pengajuan
                                </CardTitle>
                                <CardDescription className="text-sm leading-5">
                                    {canApply
                                        ? 'Isi data toko dan rencana produk yang akan dijual. Semua field bertanda * wajib diisi.'
                                        : isApproved
                                          ? 'Pengajuan sudah disetujui. Kamu tidak perlu mengirim ulang.'
                                          : 'Pengajuan sedang diproses. Form akan kembali tersedia jika ditolak.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {canApply ? (
                                    <Form action="/seller-application" method="post" className="space-y-5" disableWhileProcessing>
                                        {({ errors, processing }) => (
                                            <>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="store_name" className="text-sm font-medium text-slate-700">
                                                        Nama toko <span className="text-rose-600">*</span>
                                                    </Label>
                                                    <div className="relative">
                                                        <Store className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                                        <Input
                                                            id="store_name"
                                                            name="store_name"
                                                            required
                                                            maxLength={100}
                                                            placeholder="Contoh: Toko ATK XI RPL"
                                                            className="pl-10"
                                                            autoComplete="organization"
                                                            aria-invalid={!!errors.store_name}
                                                            aria-describedby={errors.store_name ? 'store_name-error' : undefined}
                                                            value={storeName}
                                                            onChange={(e) => setStoreName(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <InputError id="store_name-error" message={errors.store_name} />
                                                        <span className="ml-auto text-xs tabular-nums text-slate-400" aria-live="polite">
                                                            {storeName.length}/100
                                                        </span>
                                                    </div>
                                                    <p className="text-xs leading-4 text-slate-500">Nama akan tampil di katalog &amp; halaman toko.</p>
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                                                        Nomor WhatsApp <span className="text-rose-600">*</span>
                                                    </Label>
                                                    <div className="relative">
                                                        <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                                        <Input
                                                            id="phone"
                                                            name="phone"
                                                            required
                                                            maxLength={30}
                                                            placeholder="08xxxxxxxxxx"
                                                            className="pl-10"
                                                            inputMode="tel"
                                                            autoComplete="tel"
                                                            aria-invalid={!!errors.phone}
                                                            value={phone}
                                                            onChange={(e) => setPhone(e.target.value)}
                                                        />
                                                    </div>
                                                    <InputError message={errors.phone} />
                                                    <p className="text-xs leading-4 text-slate-500">Pastikan nomor aktif &amp; bisa dihubungi admin.</p>
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="product_plan" className="text-sm font-medium text-slate-700">
                                                        Produk yang akan dijual <span className="text-rose-600">*</span>
                                                    </Label>
                                                    <Textarea
                                                        id="product_plan"
                                                        name="product_plan"
                                                        required
                                                        maxLength={1000}
                                                        placeholder="Tulis jenis produk, contoh: makanan ringan, alat tulis, karya jurusan."
                                                        className="min-h-28"
                                                        aria-invalid={!!errors.product_plan}
                                                        value={productPlan}
                                                        onChange={(e) => setProductPlan(e.target.value)}
                                                    />
                                                    <div className="flex items-center justify-between gap-2">
                                                        <InputError message={errors.product_plan} />
                                                        <span className="ml-auto text-xs tabular-nums text-slate-400">{productPlan.length}/1000</span>
                                                    </div>
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="reason" className="text-sm font-medium text-slate-700">
                                                        Catatan tambahan <span className="text-slate-400 text-xs font-normal">(opsional)</span>
                                                    </Label>
                                                    <Textarea
                                                        id="reason"
                                                        name="reason"
                                                        maxLength={1000}
                                                        placeholder="Ceritakan alasan ingin jadi seller, pengalaman, atau jadwal jaga toko."
                                                        className="min-h-24"
                                                        aria-invalid={!!errors.reason}
                                                        value={reason}
                                                        onChange={(e) => setReason(e.target.value)}
                                                    />
                                                    <div className="flex items-center justify-between gap-2">
                                                        <InputError message={errors.reason} />
                                                        <span className="ml-auto text-xs tabular-nums text-slate-400">{reason.length}/1000</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                                    <p className="text-xs leading-5 text-slate-500">Dengan mengirim, kamu menyetujui syarat menjadi seller EduCart.</p>
                                                    <Button type="submit" disabled={processing} className="h-11 w-full rounded-xl px-6 font-semibold sm:w-auto">
                                                        {processing && <Spinner className="size-4" />}
                                                        {processing ? 'Mengirim...' : 'Kirim pengajuan'}
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </Form>
                                ) : isApproved ? (
                                    <div className="space-y-4 text-center">
                                        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#ECFDF3] ring-1 ring-emerald-200">
                                            <CheckCircle2 className="size-7 text-[#16A34A]" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-slate-900">Kamu sudah menjadi seller</h3>
                                            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                                                Selamat! Akunmu telah disetujui. Sekarang kamu bisa mengelola produk, stok, dan pesanan dari Seller Dashboard.
                                            </p>
                                        </div>
                                        <Button asChild className="h-11 w-full rounded-xl font-semibold">
                                            <Link href="/seller/dashboard">
                                                <LayoutDashboard className="size-4" />
                                                Buka Seller Dashboard
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" className="h-11 w-full rounded-xl border-slate-200">
                                            <Link href="/">Kembali ke katalog</Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex gap-3 rounded-xl border border-amber-200 bg-[#FFF7ED] p-4">
                                            <Clock3 className="mt-0.5 size-5 shrink-0 text-amber-600" />
                                            <div>
                                                <p className="text-sm font-semibold text-amber-800">Pengajuan sedang diproses</p>
                                                <p className="mt-1 text-sm leading-6 text-amber-700">
                                                    Admin sedang mereview data tokomu. Kamu akan dapat notifikasi saat ada update. Mohon tunggu 1–2 hari kerja.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-sm font-medium text-slate-900">Ringkasan pengajuan</p>
                                            <dl className="mt-3 space-y-2 text-sm">
                                                <div className="flex justify-between gap-4">
                                                    <dt className="text-slate-500">Toko</dt>
                                                    <dd className="font-medium text-slate-900">{application?.store_name}</dd>
                                                </div>
                                                <div className="flex justify-between gap-4">
                                                    <dt className="text-slate-500">WhatsApp</dt>
                                                    <dd className="font-medium text-slate-900">{application?.phone}</dd>
                                                </div>
                                                <div className="flex justify-between gap-4">
                                                    <dt className="text-slate-500">Diajukan</dt>
                                                    <dd className="text-slate-700">{formatDate(application?.created_at ?? null)}</dd>
                                                </div>
                                            </dl>
                                        </div>
                                        <Button asChild variant="outline" className="h-11 w-full rounded-xl border-slate-200">
                                            <Link href="/settings/profile">
                                                <ArrowLeft className="size-4" />
                                                Kembali ke pengaturan
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </>
    );
}
