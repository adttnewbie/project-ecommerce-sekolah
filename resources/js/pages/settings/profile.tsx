import type { PageProps as SharedPageProps } from '@inertiajs/core';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle2, Mail, Store, UserRound } from 'lucide-react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Spinner } from '@/components/ui/spinner';
import { useInitials } from '@/hooks/use-initials';
import { edit } from '@/routes/profile';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
} & SharedPageProps;

export default function Profile() {
    const { auth, flash } = usePage<PageProps>().props as PageProps & { flash?: { success?: string; error?: string } };
    const user = auth.user;
    const getInitials = useInitials();

    if (!user) {
        return null;
    }

    return (
        <>
            <Head title="Pengaturan profil" />

            <h1 className="sr-only">Pengaturan profil</h1>

            {(flash?.success || flash?.error) && (
                <div
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm ${
                        flash.error
                            ? 'border-rose-200 bg-rose-50 text-rose-700'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    }`}
                    role="status"
                    aria-live="polite"
                >
                    <CheckCircle2 className={`mt-0.5 size-4 shrink-0 ${flash.error ? 'text-rose-600' : 'text-emerald-600'}`} />
                    <p className="leading-5">{flash.error ?? flash.success}</p>
                </div>
            )}

            <Card className="rounded-[14px] border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                <CardHeader className="pb-4">
                    <div className="flex items-start gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#EFF8FF] ring-1 ring-[#BCE0FF]">
                            <UserRound className="size-5 text-[#0080FF]" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-base font-semibold leading-none text-slate-900">
                                Profil
                            </CardTitle>
                            <CardDescription className="mt-1.5 line-clamp-none text-sm leading-5 text-slate-500">
                                Perbarui nama dan email akun. Perubahan akan langsung terlihat di seluruh aplikasi.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <Avatar className="size-11 shrink-0 rounded-full border border-slate-200 bg-white">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="rounded-full bg-[#EFF8FF] text-sm font-semibold text-[#0080FF]">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                            <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                                <Mail className="size-3 shrink-0" />
                                {user.email}
                            </p>
                        </div>
                        <span className="hidden shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200 sm:inline-flex">
                            Avatar tersimpan
                        </span>
                    </div>

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                                        Nama lengkap
                                    </Label>
                                    <Input
                                        id="name"
                                        className="block w-full"
                                        defaultValue={user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Nama lengkap"
                                        aria-invalid={Boolean(errors.name)}
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        className="block w-full"
                                        defaultValue={user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Alamat email"
                                        aria-invalid={Boolean(errors.email)}
                                    />
                                    <p className="text-xs leading-4 text-slate-500">
                                        Email digunakan untuk login dan notifikasi penting.
                                    </p>
                                    <InputError message={errors.email} />
                                </div>

                                <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                        className="h-11 rounded-xl px-5 font-semibold"
                                    >
                                        {processing && <Spinner className="size-4" />}
                                        {processing ? 'Menyimpan...' : 'Simpan perubahan'}
                                    </Button>
                                    <span className="text-xs text-slate-500">
                                        Tekan Simpan untuk menerapkan perubahan.
                                    </span>
                                </div>
                            </>
                        )}
                    </Form>
                </CardContent>
            </Card>

            {user.role === 'buyer' && (
                <Card className="rounded-[14px] border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 ring-1 ring-emerald-200">
                                <Store className="size-5 text-emerald-600" />
                            </span>
                            <div>
                                <CardTitle className="text-base font-semibold text-slate-900">Akun seller</CardTitle>
                                <CardDescription className="mt-1 line-clamp-none text-sm leading-5 text-slate-500">
                                    Ajukan akun seller jika ingin mulai menjual produk di EduCart.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        Ajukan jadi seller
                                    </h3>
                                    <p className="mt-1 text-sm leading-5 text-slate-500">
                                        Admin akan meninjau data toko sebelum akun kamu berubah menjadi seller.
                                    </p>
                                </div>
                                <Button asChild className="h-11 w-full shrink-0 rounded-xl px-5 font-semibold sm:w-auto">
                                    <Link href="/seller-application">Buka pengajuan</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan profil',
            href: edit(),
        },
    ],
};
