import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Eye,
    EyeOff,
    ShieldCheck,
    UserPlus,
    Warehouse,
} from 'lucide-react';
import { useState } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type UpJurusan = {
    id: number;
    name: string;
    description: string | null;
    picket_officers: { id: number; name: string; email: string }[];
};

type Props = { upJurusan: UpJurusan | null };

export default function CreatePicketOfficer({ upJurusan }: Props) {
    const { flash } = usePage().props as unknown as {
        flash: { success?: string; error?: string };
    };
    const hasPicket = Boolean(upJurusan?.picket_officers.length);
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <>
            <Head title="Buat Picket Officer" />
            <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <Badge className="mb-2 rounded-full bg-blue-50 text-blue-700">
                            <UserPlus className="size-3.5" />
                            Auto assign UP Jurusan
                        </Badge>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                            Buat Akun Picket Officer
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                            Akun picket yang dibuat di sini otomatis terhubung
                            ke UP Jurusan milikmu. Satu UP hanya punya satu
                            picket.
                        </p>
                    </div>
                    <Button
                        asChild
                        variant="outline"
                        className="shrink-0 rounded-lg"
                    >
                        <Link href="/admin-jurusan/up-jurusan">
                            <ArrowLeft className="size-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                {flash.success && (
                    <Alert className="rounded-xl border-emerald-200 bg-emerald-50 text-emerald-800">
                        <ShieldCheck className="size-4" />
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

                <Card className="rounded-xl border-slate-200 shadow-sm">
                    <CardHeader className="border-b border-slate-100">
                        <CardTitle className="flex items-center gap-2">
                            <Warehouse className="size-5 text-blue-700" />
                            UP Tujuan
                        </CardTitle>
                        <CardDescription>
                            Picket officer hanya boleh mengelola satu UP
                            Jurusan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-5">
                        {upJurusan ? (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-900">
                                            {upJurusan.name}
                                        </p>
                                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                                            {upJurusan.description ||
                                                'Tidak ada deskripsi'}
                                        </p>
                                    </div>
                                    <Badge className="w-fit shrink-0 rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                                        Aktif
                                    </Badge>
                                </div>
                                <p className="mt-3 text-xs text-slate-500">
                                    Picket yang dibuat akan otomatis memiliki{' '}
                                    <span className="font-medium text-slate-700">
                                        up_jurusan_id = {upJurusan.id}
                                    </span>{' '}
                                    dan bisa langsung login ke POS.
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                                <p className="text-sm font-medium text-amber-900">
                                    UP belum ada
                                </p>
                                <p className="mt-1 text-sm leading-6 text-amber-800">
                                    Buat UP Jurusan terlebih dahulu di halaman
                                    UP Jurusan sebelum membuat akun picket
                                    officer.
                                </p>
                                <Button
                                    asChild
                                    size="sm"
                                    className="mt-3 rounded-lg"
                                >
                                    <Link href="/admin-jurusan/up-jurusan">
                                        Buat UP Jurusan
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {hasPicket && upJurusan && (
                    <Card className="rounded-xl border-slate-200 shadow-sm">
                        <CardHeader className="border-b border-slate-100">
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="size-5 text-emerald-600" />
                                Picket Sudah Ada
                            </CardTitle>
                            <CardDescription>
                                Satu UP Jurusan hanya memiliki satu akun picket
                                officer. Kelola atau ganti via UP Jurusan jika
                                perlu.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 p-5">
                            {upJurusan.picket_officers.map((picket) => (
                                <div
                                    key={picket.id}
                                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
                                >
                                    <span className="grid size-10 place-items-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                                        {picket.name.charAt(0).toUpperCase()}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-slate-900">
                                            {picket.name}
                                        </p>
                                        <p className="truncate text-sm text-slate-500">
                                            {picket.email}
                                        </p>
                                    </div>
                                    <Badge className="ml-auto rounded-md bg-emerald-50 text-emerald-700">
                                        Terhubung
                                    </Badge>
                                </div>
                            ))}
                            <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm leading-6 text-blue-700">
                                Ingin ganti picket? Lepas penugasan dari halaman
                                UP Jurusan, lalu buat akun picket baru di sini.
                            </div>
                        </CardContent>
                    </Card>
                )}

                {upJurusan && !hasPicket && (
                    <Card className="rounded-xl border-slate-200 shadow-sm">
                        <CardHeader className="border-b border-slate-100">
                            <CardTitle>Informasi Akun</CardTitle>
                            <CardDescription>
                                Password bisa diganti oleh picket setelah login.
                                Gunakan email sekolah yang valid.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5">
                            <Form
                                action={`/admin-jurusan/up-jurusan/${upJurusan.id}/pickets`}
                                method="post"
                                className="space-y-5"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <label className="space-y-2">
                                                <span className="text-sm font-medium text-slate-700">
                                                    Nama *
                                                </span>
                                                <Input
                                                    name="name"
                                                    placeholder="Contoh: Budi Picket"
                                                    required
                                                    className="h-11 rounded-lg"
                                                    aria-invalid={Boolean(
                                                        errors.name,
                                                    )}
                                                />
                                                <InputError
                                                    message={errors.name}
                                                    className="text-xs"
                                                />
                                            </label>
                                            <label className="space-y-2">
                                                <span className="text-sm font-medium text-slate-700">
                                                    Email *
                                                </span>
                                                <Input
                                                    name="email"
                                                    type="email"
                                                    placeholder="picket@example.sch.id"
                                                    required
                                                    className="h-11 rounded-lg"
                                                    aria-invalid={Boolean(
                                                        errors.email,
                                                    )}
                                                />
                                                <InputError
                                                    message={errors.email}
                                                    className="text-xs"
                                                />
                                            </label>
                                            <label className="space-y-2">
                                                <span className="text-sm font-medium text-slate-700">
                                                    Password *
                                                </span>
                                                <div className="relative">
                                                    <Input
                                                        name="password"
                                                        type={
                                                            showPw
                                                                ? 'text'
                                                                : 'password'
                                                        }
                                                        placeholder="Minimal 8 karakter"
                                                        required
                                                        className="h-11 rounded-lg pr-10"
                                                        aria-invalid={Boolean(
                                                            errors.password,
                                                        )}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setShowPw(!showPw)
                                                        }
                                                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                                        aria-label={
                                                            showPw
                                                                ? 'Sembunyikan password'
                                                                : 'Tampilkan password'
                                                        }
                                                    >
                                                        {showPw ? (
                                                            <EyeOff className="size-4" />
                                                        ) : (
                                                            <Eye className="size-4" />
                                                        )}
                                                    </button>
                                                </div>
                                                <InputError
                                                    message={errors.password}
                                                    className="text-xs"
                                                />
                                                <p className="text-xs text-slate-500">
                                                    Gunakan kombinasi huruf,
                                                    angka, dan simbol untuk
                                                    keamanan.
                                                </p>
                                            </label>
                                            <label className="space-y-2">
                                                <span className="text-sm font-medium text-slate-700">
                                                    Konfirmasi Password *
                                                </span>
                                                <div className="relative">
                                                    <Input
                                                        name="password_confirmation"
                                                        type={
                                                            showConfirm
                                                                ? 'text'
                                                                : 'password'
                                                        }
                                                        placeholder="Ulangi password"
                                                        required
                                                        className="h-11 rounded-lg pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setShowConfirm(
                                                                !showConfirm,
                                                            )
                                                        }
                                                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                                        aria-label={
                                                            showConfirm
                                                                ? 'Sembunyikan'
                                                                : 'Tampilkan'
                                                        }
                                                    >
                                                        {showConfirm ? (
                                                            <EyeOff className="size-4" />
                                                        ) : (
                                                            <Eye className="size-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                                            Dengan membuat akun ini, picket
                                            officer akan otomatis terhubung ke{' '}
                                            <span className="font-medium text-slate-900">
                                                {upJurusan.name}
                                            </span>{' '}
                                            dan bisa akses POS, Receiving, dan
                                            Laporan.
                                        </div>

                                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                                            <Button
                                                asChild
                                                type="button"
                                                variant="outline"
                                                className="rounded-lg"
                                            >
                                                <Link href="/admin-jurusan/up-jurusan">
                                                    Batal
                                                </Link>
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="rounded-lg"
                                            >
                                                {processing
                                                    ? 'Membuat...'
                                                    : 'Buat & Assign'}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

CreatePicketOfficer.layout = {
    breadcrumbs: [
        { title: 'UP Jurusan', href: '/admin-jurusan/up-jurusan' },
        {
            title: 'Buat Picket Officer',
            href: '/admin-jurusan/picket-officer/create',
        },
    ],
};
