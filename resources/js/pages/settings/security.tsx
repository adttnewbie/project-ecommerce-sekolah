import { Form, Head } from '@inertiajs/react';
import { Lock } from 'lucide-react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import type { Props as ManagePasskeysProps } from '@/components/manage-passkeys';
import ManagePasskeys from '@/components/manage-passkeys';
import type { Props as ManageTwoFactorProps } from '@/components/manage-two-factor';
import ManageTwoFactor from '@/components/manage-two-factor';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { edit } from '@/routes/security';

type Props = {
    passwordRules: string;
} & ManagePasskeysProps &
    ManageTwoFactorProps;

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title="Pengaturan keamanan" />

            <h1 className="sr-only">Pengaturan keamanan</h1>

            <Card className="rounded-[14px] border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                <CardHeader className="pb-4">
                    <div className="flex items-start gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#EFF8FF] ring-1 ring-[#BCE0FF]">
                            <Lock className="size-5 text-[#0080FF]" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-base font-semibold leading-none text-slate-900">
                                Ubah password
                            </CardTitle>
                            <CardDescription className="mt-1.5 line-clamp-none text-sm leading-5 text-slate-500">
                                Gunakan password yang kuat untuk menjaga akun tetap aman. Jangan bagikan password kepada siapa pun.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Form
                        {...SecurityController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="space-y-5"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="current_password" className="text-sm font-medium text-slate-700">
                                        Password saat ini
                                    </Label>

                                    <PasswordInput
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        name="current_password"
                                        className="block w-full"
                                        autoComplete="current-password"
                                        placeholder="Masukkan password saat ini"
                                    />

                                    <InputError message={errors.current_password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password baru</Label>

                                    <PasswordInput
                                        id="password"
                                        ref={passwordInput}
                                        name="password"
                                        className="block w-full"
                                        autoComplete="new-password"
                                        placeholder="Buat password baru"
                                        passwordrules={props.passwordRules}
                                    />

                                    <p className="text-xs leading-4 text-slate-500">
                                        Minimal 8 karakter, kombinasi huruf besar, huruf kecil, angka, dan simbol lebih aman.
                                    </p>
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation" className="text-sm font-medium text-slate-700">
                                        Konfirmasi password baru
                                    </Label>

                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        className="block w-full"
                                        autoComplete="new-password"
                                        placeholder="Ulangi password baru"
                                        passwordrules={props.passwordRules}
                                    />

                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                                    <Button
                                        disabled={processing}
                                        data-test="update-password-button"
                                        className="h-11 rounded-xl px-5 font-semibold"
                                    >
                                        {processing && <Spinner className="size-4" />}
                                        {processing ? 'Menyimpan...' : 'Simpan password'}
                                    </Button>
                                    <span className="text-xs text-slate-500">
                                        Password akan langsung berlaku untuk login berikutnya.
                                    </span>
                                </div>
                            </>
                        )}
                    </Form>
                </CardContent>
            </Card>

            <ManageTwoFactor
                canManageTwoFactor={props.canManageTwoFactor}
                requiresConfirmation={props.requiresConfirmation}
                twoFactorEnabled={props.twoFactorEnabled}
            />

            <ManagePasskeys
                canManagePasskeys={props.canManagePasskeys}
                passkeys={props.passkeys}
            />
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan keamanan',
            href: edit(),
        },
    ],
};
