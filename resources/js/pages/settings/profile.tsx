import type { PageProps as SharedPageProps } from '@inertiajs/core';
import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronRight,
    Heart,
    LogOut,
    Mail,
    PackageCheck,
    Pencil,
    Phone,
    ShieldCheck,
    ShoppingCart,
    Store,
    UserRound,
} from 'lucide-react';
import { useState } from 'react';
import type { ComponentType } from 'react';
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
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { index as cartIndex } from '@/routes/cart';
import { index as ordersIndex } from '@/routes/orders';
import { edit } from '@/routes/profile';
import { edit as securityEdit } from '@/routes/security';
import { index as wishlistIndex } from '@/routes/wishlist';
import type { Auth, NavItem } from '@/types';

type PageProps = {
    auth: Auth;
} & SharedPageProps;

type Shortcut = {
    label: string;
    href: NavItem['href'];
    icon: ComponentType<{ className?: string }>;
};

type MenuRow = {
    label: string;
    description: string;
    href: NavItem['href'];
    icon: ComponentType<{ className?: string }>;
};

export default function Profile() {
    const { auth, flash } = usePage<PageProps>().props as PageProps & {
        flash?: { success?: string; error?: string };
    };
    const user = auth.user;
    const getInitials = useInitials();
    const [loggingOut, setLoggingOut] = useState(false);

    if (!user) {
        return null;
    }

    const shortcuts: Shortcut[] = [
        { label: 'Pesanan', href: ordersIndex(), icon: PackageCheck },
        { label: 'Wishlist', href: wishlistIndex(), icon: Heart },
        { label: 'Keranjang', href: cartIndex(), icon: ShoppingCart },
    ];

    const accountMenu: MenuRow[] = [
        {
            label: 'Edit Profil',
            description: 'Nama, email, nomor WhatsApp',
            href: '#edit-profil',
            icon: Pencil,
        },
        {
            label: 'Keamanan',
            description: 'Password & verifikasi dua langkah',
            href: securityEdit(),
            icon: ShieldCheck,
        },
    ];

    const handleLogout = () => {
        if (loggingOut) {
            return;
        }

        router.flushAll();
        setLoggingOut(true);
        router.post(logout().url, {});
    };

    return (
        <>
            <Head title="Akun saya" />

            <h1 className="sr-only">Akun saya</h1>

            {(flash?.success || flash?.error) && (
                <div
                    className={cn(
                        'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm',
                        flash.error
                            ? 'border-rose-200 bg-rose-50 text-rose-700'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-800',
                    )}
                    role="status"
                    aria-live="polite"
                >
                    <CheckCircle2
                        className={cn(
                            'mt-0.5 size-4 shrink-0',
                            flash.error ? 'text-rose-600' : 'text-emerald-600',
                        )}
                    />
                    <p className="leading-5">{flash.error ?? flash.success}</p>
                </div>
            )}

            {/* Header akun */}
            <Card className="overflow-hidden rounded-[14px] border-slate-200 bg-white py-0 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                <div className="bg-gradient-to-r from-[#0080FF] to-[#0059B8] px-4 pt-5 pb-10 sm:px-5">
                    <div className="flex items-center gap-3">
                        <Avatar className="size-14 shrink-0 rounded-full border-2 border-white/70 bg-white">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="rounded-full bg-[#EFF8FF] text-base font-semibold text-[#0080FF]">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-base font-bold text-white">
                                {user.name}
                            </p>
                            <p className="flex items-center gap-1 truncate text-xs text-blue-100">
                                <Mail className="size-3 shrink-0" />
                                {user.email}
                            </p>
                            {user.phone && (
                                <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-blue-100">
                                    <Phone className="size-3 shrink-0" />
                                    {user.phone}
                                </p>
                            )}
                        </div>
                        <span className="hidden shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/30 sm:inline-flex">
                            Buyer
                        </span>
                    </div>
                </div>
                <CardContent className="px-4 pb-4 sm:px-5">
                    <div className="-mt-7 grid grid-cols-3 gap-2.5">
                        {shortcuts.map((item) => {
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="flex flex-col items-center gap-1.5 rounded-[12px] border border-slate-200 bg-white px-2 py-3.5 text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition hover:border-[#BCE0FF] hover:text-[#0080FF] focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:outline-none"
                                >
                                    <span className="grid size-9 place-items-center rounded-full bg-[#EFF8FF] text-[#0080FF]">
                                        <Icon className="size-4" />
                                    </span>
                                    <span className="text-xs font-semibold">
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Menu akun */}
            <Card className="rounded-[14px] border-slate-200 bg-white py-0 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                <CardHeader className="px-4 pt-4 pb-1 sm:px-5">
                    <CardTitle className="text-base font-semibold text-slate-900">
                        Akun saya
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-2 pb-2 sm:px-3 sm:pb-3">
                    {accountMenu.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="flex items-center gap-3 rounded-[12px] px-3 py-3 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:outline-none"
                            >
                                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600">
                                    <Icon className="size-4" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-semibold text-slate-900">
                                        {item.label}
                                    </span>
                                    <span className="block truncate text-xs text-slate-500">
                                        {item.description}
                                    </span>
                                </span>
                                <ChevronRight
                                    className="size-4 shrink-0 text-slate-400"
                                    aria-hidden
                                />
                            </Link>
                        );
                    })}
                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex w-full cursor-pointer items-center gap-3 rounded-[12px] px-3 py-3 text-left transition hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none disabled:opacity-60"
                    >
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-600">
                            {loggingOut ? (
                                <Spinner className="size-4" />
                            ) : (
                                <LogOut className="size-4" />
                            )}
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-rose-700">
                                {loggingOut ? 'Keluar...' : 'Keluar'}
                            </span>
                            <span className="block truncate text-xs text-slate-500">
                                Keluar dari akun ini
                            </span>
                        </span>
                    </button>
                </CardContent>
            </Card>

            {/* Pengajuan seller */}
            {user.role === 'buyer' && (
                <Card className="rounded-[14px] border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 ring-1 ring-emerald-200">
                                <Store className="size-5 text-emerald-600" />
                            </span>
                            <div>
                                <CardTitle className="text-base font-semibold text-slate-900">
                                    Akun seller
                                </CardTitle>
                                <CardDescription className="mt-1 line-clamp-none text-sm leading-5 text-slate-500">
                                    Ajukan akun seller jika ingin mulai menjual
                                    produk di EduCart.
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
                                        Admin akan meninjau data toko sebelum
                                        akun kamu berubah menjadi seller.
                                    </p>
                                </div>
                                <Button
                                    asChild
                                    className="h-11 w-full shrink-0 rounded-xl px-5 font-semibold sm:w-auto"
                                >
                                    <Link href="/seller-application">
                                        Buka pengajuan
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Form edit profil */}
            <Card
                id="edit-profil"
                className="scroll-mt-24 rounded-[14px] border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
            >
                <CardHeader className="pb-4">
                    <div className="flex items-start gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#EFF8FF] ring-1 ring-[#BCE0FF]">
                            <UserRound className="size-5 text-[#0080FF]" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-base leading-none font-semibold text-slate-900">
                                Edit profil
                            </CardTitle>
                            <CardDescription className="mt-1.5 line-clamp-none text-sm leading-5 text-slate-500">
                                Perbarui nama, email, dan nomor WhatsApp.
                                Perubahan langsung terlihat di seluruh aplikasi.
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
                            <p className="truncate text-sm font-semibold text-slate-900">
                                {user.name}
                            </p>
                            <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                                <Mail className="size-3 shrink-0" />
                                {user.email}
                            </p>
                        </div>
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
                                    <Label
                                        htmlFor="name"
                                        className="text-sm font-medium text-slate-700"
                                    >
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
                                    <Label
                                        htmlFor="email"
                                        className="text-sm font-medium text-slate-700"
                                    >
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
                                        Email digunakan untuk login dan
                                        notifikasi penting.
                                    </p>
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="phone"
                                        className="text-sm font-medium text-slate-700"
                                    >
                                        Nomor WhatsApp
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        className="block w-full"
                                        defaultValue={user.phone ?? ''}
                                        name="phone"
                                        autoComplete="tel"
                                        placeholder="08..."
                                        aria-invalid={Boolean(errors.phone)}
                                    />
                                    <p className="text-xs leading-4 text-slate-500">
                                        Dipakai untuk notifikasi WhatsApp. Boleh
                                        dikosongkan.
                                    </p>
                                    <InputError message={errors.phone} />
                                </div>

                                <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                        className="h-11 rounded-xl px-5 font-semibold"
                                    >
                                        {processing && (
                                            <Spinner className="size-4" />
                                        )}
                                        {processing
                                            ? 'Menyimpan...'
                                            : 'Simpan perubahan'}
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
