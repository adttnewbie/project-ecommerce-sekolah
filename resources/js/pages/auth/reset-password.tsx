import { Form, Head } from '@inertiajs/react';
import { KeyRound, Lock, Mail } from 'lucide-react';
import {
    authErrorClassName,
    authFieldClassName,
    authIconClassName,
    authInputClassName,
    authLabelClassName,
    authPrimaryButtonClassName,
} from '@/components/auth-ui';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
    passwordRules: string;
};

export default function ResetPassword({ token, email, passwordRules }: Props) {
    return (
        <>
            <Head title="Atur ulang kata sandi" />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
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
                                    value={email}
                                    readOnly
                                    tabIndex={-1}
                                    className={`${authInputClassName} bg-slate-50 text-slate-500`}
                                />
                            </div>
                            <InputError
                                message={errors.email}
                                className={authErrorClassName}
                            />
                        </div>

                        <div className={authFieldClassName}>
                            <Label
                                htmlFor="password"
                                className={authLabelClassName}
                            >
                                Kata sandi baru
                            </Label>
                            <div className="relative">
                                <Lock className={authIconClassName} />
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    autoComplete="new-password"
                                    autoFocus
                                    required
                                    placeholder="Minimal 8 karakter"
                                    passwordrules={passwordRules}
                                    className={authInputClassName}
                                    aria-invalid={Boolean(errors.password)}
                                />
                            </div>
                            <InputError
                                message={errors.password}
                                className={authErrorClassName}
                            />
                        </div>

                        <div className={authFieldClassName}>
                            <Label
                                htmlFor="password_confirmation"
                                className={authLabelClassName}
                            >
                                Konfirmasi kata sandi baru
                            </Label>
                            <div className="relative">
                                <KeyRound className={authIconClassName} />
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    autoComplete="new-password"
                                    required
                                    placeholder="Ulangi kata sandi baru"
                                    passwordrules={passwordRules}
                                    className={authInputClassName}
                                    aria-invalid={Boolean(
                                        errors.password_confirmation,
                                    )}
                                />
                            </div>
                            <InputError
                                message={errors.password_confirmation}
                                className={authErrorClassName}
                            />
                        </div>

                        <Button
                            type="submit"
                            className={authPrimaryButtonClassName}
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing && <Spinner />}
                            Simpan kata sandi baru
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

ResetPassword.layout = {
    title: 'Atur ulang kata sandi',
    description: 'Buat kata sandi baru yang aman untuk akunmu.',
};
