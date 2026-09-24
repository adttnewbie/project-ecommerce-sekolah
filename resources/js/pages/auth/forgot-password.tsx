import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Mail, Send } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Lupa kata sandi" />

            <div className="flex flex-col gap-5">
                <Form {...email.form()} className="flex flex-col gap-4">
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
                                        autoComplete="email"
                                        autoFocus
                                        required
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

                            <Button
                                className={authPrimaryButtonClassName}
                                disabled={processing}
                                data-test="email-password-reset-link-button"
                            >
                                {processing ? (
                                    <Spinner />
                                ) : (
                                    <Send className="size-4" />
                                )}
                                Kirim link reset
                            </Button>
                        </>
                    )}
                </Form>

                <div className="border-t border-slate-100 pt-4 text-center text-sm leading-6 text-slate-500">
                    Ingat kata sandinya?{' '}
                    <Link href={login()} className={authMutedLinkClassName}>
                        <ArrowLeft className="mr-1 inline size-4" />
                        Kembali masuk
                    </Link>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Lupa kata sandi?',
    description: 'Masukkan emailmu, kami kirimkan link untuk reset kata sandi.',
};
