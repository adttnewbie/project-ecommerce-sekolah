import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    Eye,
    EyeOff,
    KeyRound,
    Loader2,
    Mail,
    ShieldCheck,
    User,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { cn } from '@/lib/utils';

const passwordRules = [
    {
        label: 'Minimal 12 karakter',
        test: (value: string) => value.length >= 12,
    },
    {
        label: 'Huruf besar & kecil',
        test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value),
    },
    { label: 'Angka', test: (value: string) => /\d/.test(value) },
    { label: 'Simbol', test: (value: string) => /[^a-zA-Z0-9]/.test(value) },
];

const strengthLevels = [
    { bar: 'bg-slate-200', text: 'text-slate-400', label: 'Belum ada' },
    { bar: 'bg-rose-500', text: 'text-rose-600', label: 'Lemah' },
    { bar: 'bg-orange-500', text: 'text-orange-600', label: 'Sedang' },
    { bar: 'bg-amber-500', text: 'text-amber-600', label: 'Baik' },
    { bar: 'bg-emerald-500', text: 'text-emerald-600', label: 'Kuat' },
];

const getInitials = (value: string) =>
    value
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .join('');

export default function CreateAdminJurusan() {
    const { flash } = usePage().props;
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const score = passwordRules.filter((rule) => rule.test(password)).length;
    const strength = strengthLevels[score];
    const passwordsMatch =
        passwordConfirmation.length > 0 && password === passwordConfirmation;

    return (
        <>
            <Head title="Buat Admin Jurusan" />
            <main className="min-h-[calc(100svh-4rem)] bg-slate-50 p-4 sm:p-6">
                <div className="mx-auto max-w-5xl space-y-6">
                    <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="hidden size-12 shrink-0 rounded-[8px] bg-gradient-to-br from-blue-600 to-blue-800 shadow-sm sm:flex sm:items-center sm:justify-center">
                                <ShieldCheck className="size-6 text-white" />
                            </div>
                            <div>
                                <Badge className="mb-2 rounded-[6px] bg-blue-50 text-blue-700">
                                    <ShieldCheck className="size-3.5" />
                                    Akun pengelola jurusan
                                </Badge>
                                <h1 className="text-2xl font-semibold text-slate-950">
                                    Buat Admin Jurusan
                                </h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    Akun ini mengelola UP Jurusan dan dapat
                                    membuat satu akun picket officer untuk
                                    jurusannya.
                                </p>
                            </div>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            className="w-full rounded-[8px] sm:w-auto"
                        >
                            <Link href="/admin/users">
                                <ArrowLeft className="size-4" />
                                Kembali
                            </Link>
                        </Button>
                    </section>

                    {(flash.success || flash.error) && (
                        <Alert
                            className={cn(
                                'rounded-[8px] shadow-sm',
                                flash.error
                                    ? 'border-rose-200 bg-rose-50'
                                    : 'border-emerald-200 bg-emerald-50',
                            )}
                        >
                            {flash.error ? (
                                <CheckCircle2 className="size-4 text-rose-600" />
                            ) : (
                                <CheckCircle2 className="size-4 text-emerald-600" />
                            )}
                            <AlertDescription
                                className={
                                    flash.error
                                        ? 'text-rose-700'
                                        : 'text-emerald-700'
                                }
                            >
                                {flash.error || flash.success}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
                        <Card className="gap-0 rounded-[8px] border-slate-100 py-0 shadow-sm">
                            <CardHeader className="border-b border-slate-100 p-5">
                                <CardTitle>Informasi Akun</CardTitle>
                                <CardDescription>
                                    Lengkapi data di bawah ini untuk membuat
                                    akun admin jurusan baru.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-5">
                                <Form
                                    action="/admin/users"
                                    method="post"
                                    className="space-y-8"
                                >
                                    {({ errors, processing }) => (
                                        <>
                                            <input
                                                type="hidden"
                                                name="role"
                                                value="admin_jurusan"
                                            />

                                            <fieldset className="space-y-5">
                                                <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
                                                    <User className="size-4 text-blue-700" />
                                                    Detail Pengguna
                                                </legend>
                                                <div className="grid gap-5 sm:grid-cols-2">
                                                    <label className="space-y-2">
                                                        <span className="text-sm font-medium text-slate-700">
                                                            Nama
                                                        </span>
                                                        <Input
                                                            name="name"
                                                            value={name}
                                                            onChange={(event) =>
                                                                setName(
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Nama admin jurusan"
                                                            required
                                                            autoComplete="off"
                                                            className="min-h-11 rounded-[8px] border-slate-200 bg-white"
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.name
                                                            }
                                                            className="text-xs"
                                                        />
                                                    </label>
                                                    <label className="space-y-2">
                                                        <span className="text-sm font-medium text-slate-700">
                                                            Email
                                                        </span>
                                                        <Input
                                                            name="email"
                                                            type="email"
                                                            value={email}
                                                            onChange={(event) =>
                                                                setEmail(
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="admin-jurusan@example.sch.id"
                                                            required
                                                            autoComplete="off"
                                                            className="min-h-11 rounded-[8px] border-slate-200 bg-white"
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.email
                                                            }
                                                            className="text-xs"
                                                        />
                                                    </label>
                                                </div>
                                            </fieldset>

                                            <fieldset className="space-y-5">
                                                <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
                                                    <KeyRound className="size-4 text-blue-700" />
                                                    Keamanan
                                                </legend>

                                                <div className="space-y-3">
                                                    <label className="block space-y-2">
                                                        <span className="text-sm font-medium text-slate-700">
                                                            Password
                                                        </span>
                                                        <div className="relative">
                                                            <Input
                                                                name="password"
                                                                type={
                                                                    showPassword
                                                                        ? 'text'
                                                                        : 'password'
                                                                }
                                                                value={password}
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setPassword(
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="Buat password kuat"
                                                                required
                                                                autoComplete="new-password"
                                                                className="min-h-11 rounded-[8px] border-slate-200 bg-white pr-10"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setShowPassword(
                                                                        (
                                                                            visible,
                                                                        ) =>
                                                                            !visible,
                                                                    )
                                                                }
                                                                aria-label={
                                                                    showPassword
                                                                        ? 'Sembunyikan password'
                                                                        : 'Tampilkan password'
                                                                }
                                                                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                                                            >
                                                                {showPassword ? (
                                                                    <EyeOff className="size-4" />
                                                                ) : (
                                                                    <Eye className="size-4" />
                                                                )}
                                                            </button>
                                                        </div>
                                                        <InputError
                                                            message={
                                                                errors.password
                                                            }
                                                            className="text-xs"
                                                        />
                                                    </label>

                                                    <div className="space-y-2 rounded-[8px] border border-slate-100 bg-slate-50 p-4">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-medium text-slate-500">
                                                                Kekuatan
                                                                password
                                                            </span>
                                                            <span
                                                                className={cn(
                                                                    'text-xs font-semibold',
                                                                    strength.text,
                                                                )}
                                                            >
                                                                {strength.label}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-1.5">
                                                            {[0, 1, 2, 3].map(
                                                                (index) => (
                                                                    <span
                                                                        key={
                                                                            index
                                                                        }
                                                                        className={cn(
                                                                            'h-1.5 flex-1 rounded-full transition-colors',
                                                                            index <
                                                                                score
                                                                                ? strength.bar
                                                                                : 'bg-slate-200',
                                                                        )}
                                                                    />
                                                                ),
                                                            )}
                                                        </div>
                                                        <ul className="grid gap-1.5 pt-1 sm:grid-cols-2">
                                                            {passwordRules.map(
                                                                (rule) => {
                                                                    const met =
                                                                        rule.test(
                                                                            password,
                                                                        );

                                                                    return (
                                                                        <li
                                                                            key={
                                                                                rule.label
                                                                            }
                                                                            className={cn(
                                                                                'flex items-center gap-1.5 text-xs',
                                                                                met
                                                                                    ? 'text-emerald-700'
                                                                                    : 'text-slate-400',
                                                                            )}
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    'size-3.5',
                                                                                    met &&
                                                                                        'text-emerald-600',
                                                                                )}
                                                                            />
                                                                            {
                                                                                rule.label
                                                                            }
                                                                        </li>
                                                                    );
                                                                },
                                                            )}
                                                        </ul>
                                                    </div>
                                                </div>

                                                <label className="block space-y-2">
                                                    <span className="text-sm font-medium text-slate-700">
                                                        Konfirmasi Password
                                                    </span>
                                                    <div className="relative">
                                                        <Input
                                                            name="password_confirmation"
                                                            type={
                                                                showConfirmation
                                                                    ? 'text'
                                                                    : 'password'
                                                            }
                                                            value={
                                                                passwordConfirmation
                                                            }
                                                            onChange={(event) =>
                                                                setPasswordConfirmation(
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Ulangi password"
                                                            required
                                                            autoComplete="new-password"
                                                            className="min-h-11 rounded-[8px] border-slate-200 bg-white pr-10"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setShowConfirmation(
                                                                    (visible) =>
                                                                        !visible,
                                                                )
                                                            }
                                                            aria-label={
                                                                showConfirmation
                                                                    ? 'Sembunyikan konfirmasi password'
                                                                    : 'Tampilkan konfirmasi password'
                                                            }
                                                            className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                                                        >
                                                            {showConfirmation ? (
                                                                <EyeOff className="size-4" />
                                                            ) : (
                                                                <Eye className="size-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    {passwordConfirmation.length >
                                                        0 && (
                                                        <p
                                                            className={cn(
                                                                'text-xs',
                                                                passwordsMatch
                                                                    ? 'text-emerald-700'
                                                                    : 'text-rose-600',
                                                            )}
                                                        >
                                                            {passwordsMatch
                                                                ? 'Password cocok'
                                                                : 'Password belum cocok'}
                                                        </p>
                                                    )}
                                                    <InputError
                                                        message={
                                                            errors.password_confirmation
                                                        }
                                                        className="text-xs"
                                                    />
                                                </label>
                                            </fieldset>

                                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                                                <Button
                                                    asChild
                                                    type="button"
                                                    variant="outline"
                                                    className="rounded-[8px]"
                                                >
                                                    <Link href="/admin/users">
                                                        Batal
                                                    </Link>
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="rounded-[8px]"
                                                >
                                                    {processing && (
                                                        <Loader2 className="size-4 animate-spin" />
                                                    )}
                                                    {processing
                                                        ? 'Membuat...'
                                                        : 'Buat Akun'}
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Form>
                            </CardContent>
                        </Card>

                        <div className="space-y-4 lg:sticky lg:top-20">
                            <Card className="gap-0 rounded-[8px] border-slate-100 py-0 shadow-sm">
                                <CardHeader className="border-b border-slate-100 p-5 pb-4">
                                    <CardTitle className="text-base">
                                        Ringkasan Akun
                                    </CardTitle>
                                    <CardDescription>
                                        Pratinjau data yang akan dibuat.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-5">
                                    <div className="flex flex-col items-center gap-3 text-center">
                                        <div className="flex size-14 items-center justify-center overflow-hidden rounded-full bg-blue-50 ring-1 ring-blue-100">
                                            {getInitials(name) ? (
                                                <span className="text-lg font-semibold text-blue-700">
                                                    {getInitials(name)}
                                                </span>
                                            ) : (
                                                <User className="size-6 text-blue-300" />
                                            )}
                                        </div>
                                        <div className="space-y-0.5">
                                            <p
                                                className={cn(
                                                    'font-medium',
                                                    name
                                                        ? 'text-slate-950'
                                                        : 'text-slate-400',
                                                )}
                                            >
                                                {name || 'Nama belum diisi'}
                                            </p>
                                            <p
                                                className={cn(
                                                    'truncate text-xs',
                                                    email
                                                        ? 'text-slate-500'
                                                        : 'text-slate-400',
                                                )}
                                            >
                                                {email || 'email@contoh.sch.id'}
                                            </p>
                                        </div>
                                        <Badge className="rounded-[6px] bg-blue-50 text-blue-700">
                                            <ShieldCheck className="size-3.5" />
                                            Admin Jurusan
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="gap-0 rounded-[8px] border-blue-100 bg-blue-50/50 py-0 shadow-sm">
                                <CardHeader className="border-b border-blue-100/70 p-5 pb-4">
                                    <CardTitle className="text-base">
                                        Panduan Singkat
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 p-5">
                                    {[
                                        {
                                            icon: Mail,
                                            title: 'Email sekolah aktif',
                                            body: 'Gunakan email sekolah agar pemulihan akses lebih mudah.',
                                        },
                                        {
                                            icon: KeyRound,
                                            title: 'Password kuat',
                                            body: 'Minimal 12 karakter dengan huruf besar, kecil, angka, dan simbol.',
                                        },
                                        {
                                            icon: ShieldCheck,
                                            title: 'Wewenang terbatas',
                                            body: 'Admin jurusan hanya mengelola UP Jurusannya dan bisa membuat satu picket officer.',
                                        },
                                    ].map((tip) => (
                                        <div
                                            key={tip.title}
                                            className="flex items-start gap-3"
                                        >
                                            <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-white shadow-sm">
                                                <tip.icon className="size-3.5 text-blue-700" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-950">
                                                    {tip.title}
                                                </p>
                                                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                                                    {tip.body}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

CreateAdminJurusan.layout = {
    breadcrumbs: [
        { title: 'Users', href: '/admin/users' },
        {
            title: 'Buat Admin Jurusan',
            href: '/admin/users/create-admin-jurusan',
        },
    ],
};
