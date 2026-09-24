import { Form, Head, Link } from '@inertiajs/react';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import {
    authErrorClassName,
    authFieldClassName,
    authIconClassName,
    authInputClassName,
    authLabelClassName,
    authMutedLinkClassName,
    authPrimaryButtonClassName,
    authStatusSuccessClassName,
} from '@/components/auth-ui';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Masuk" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        {status && (
                            <div
                                role="status"
                                className={authStatusSuccessClassName}
                            >
                                {status}
                            </div>
                        )}

                        <div className="flex flex-col gap-4">
                            <div className={authFieldClassName}>
                                <Label
                                    htmlFor="email"
                                    className={authLabelClassName}
                                >
                                    Email
                                </Label>
                                <div className="relative">
                                    <Mail className={authIconClassName} />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="contoh@email.com"
                                        className={authInputClassName}
                                        aria-invalid={Boolean(errors.email)}
                                    />
                                </div>
                                <InputError
                                    message={errors.email}
                                    className={authErrorClassName}
                                />
                            </div>

                            <div className={authFieldClassName}>
                                <div className="flex items-center gap-3">
                                    <Label
                                        htmlFor="password"
                                        className={authLabelClassName}
                                    >
                                        Kata sandi
                                    </Label>
                                    {canResetPassword && (
                                        <Link
                                            href={request()}
                                            className={`ml-auto text-[13px] ${authMutedLinkClassName}`}
                                            tabIndex={5}
                                        >
                                            Lupa kata sandi?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className={authIconClassName} />
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Masukkan kata sandi"
                                        className={authInputClassName}
                                        aria-invalid={Boolean(errors.password)}
                                    />
                                </div>
                                <InputError
                                    message={errors.password}
                                    className={authErrorClassName}
                                />
                            </div>

                            <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200/70 ring-inset">
                                <div className="flex items-center gap-2.5">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                        className="size-[18px] border-slate-300 bg-white data-checked:border-[#0080FF] data-checked:bg-[#0080FF] data-checked:text-white"
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="cursor-pointer text-sm font-medium text-slate-600"
                                    >
                                        Ingat saya di perangkat ini
                                    </Label>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className={authPrimaryButtonClassName}
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Masuk Sekarang
                                <ArrowRight
                                    className="size-4"
                                    data-icon="inline-end"
                                />
                            </Button>
                        </div>

                        <div className="border-t border-slate-100 pt-4 text-center text-sm leading-6 text-slate-500">
                            Belum punya akun?{' '}
                            <Link
                                href={register()}
                                tabIndex={6}
                                className={authMutedLinkClassName}
                            >
                                Daftar di sini
                            </Link>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Masuk ke EduCart',
    description: 'Masuk untuk mulai jual beli di lingkungan sekolah.',
};
