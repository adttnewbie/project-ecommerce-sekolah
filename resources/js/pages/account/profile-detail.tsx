import type { PageProps as SharedPageProps } from '@inertiajs/core';
import { Form, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Mail, UserRound } from 'lucide-react';
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
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
} & SharedPageProps;

export default function ProfileDetail() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const getInitials = useInitials();

    if (!user) {
        return null;
    }

    return (
        <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6 sm:px-6">
            <Button
                variant="ghost"
                onClick={() => router.get('/settings/profile')}
                className="h-10 rounded-xl px-3 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
                <ArrowLeft className="size-4" />
                Kembali ke Akun saya
            </Button>

            <Card className="rounded-[14px] border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                <CardHeader className="pb-4">
                    <div className="flex items-start gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#EFF8FF] ring-1 ring-[#BCE0FF]">
                            <UserRound className="size-5 text-[#0080FF]" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-base leading-none font-semibold text-slate-900">
                                Profil saya
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
                        options={{ preserveScroll: true }}
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
                                </div>
                            </>
                        )}
                    </Form>
                </CardContent>
            </Card>

            <DeleteUser />
        </div>
    );
}
