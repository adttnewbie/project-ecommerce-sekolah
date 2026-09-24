import { Form, Head } from '@inertiajs/react';
import { Lock } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Konfirmasi kata sandi" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className={authFieldClassName}>
                            <Label
                                htmlFor="password"
                                className={authLabelClassName}
                            >
                                Kata sandi saat ini
                            </Label>
                            <div className="relative">
                                <Lock className={authIconClassName} />
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    placeholder="Masukkan kata sandi"
                                    autoComplete="current-password"
                                    autoFocus
                                    required
                                    className={authInputClassName}
                                    aria-invalid={Boolean(errors.password)}
                                />
                            </div>
                            <InputError
                                message={errors.password}
                                className={authErrorClassName}
                            />
                        </div>

                        <Button
                            className={authPrimaryButtonClassName}
                            disabled={processing}
                            data-test="confirm-password-button"
                        >
                            {processing && <Spinner />}
                            Konfirmasi
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

ConfirmPassword.layout = {
    title: 'Konfirmasi kata sandi',
    description:
        'Area ini dilindungi. Konfirmasi kata sandimu untuk melanjutkan.',
};
