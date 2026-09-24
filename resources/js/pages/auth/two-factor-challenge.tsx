import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    authErrorClassName,
    authFieldClassName,
    authLabelClassName,
    authMutedLinkClassName,
    authPrimaryButtonClassName,
} from '@/components/auth-ui';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { store } from '@/routes/two-factor/login';

export default function TwoFactorChallenge() {
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: 'Kode pemulihan',
                description:
                    'Masukkan salah satu kode pemulihan daruratmu untuk mengakses akun.',
                toggleText: 'masuk dengan kode autentikasi',
            };
        }

        return {
            title: 'Kode autentikasi',
            description: 'Masukkan kode dari aplikasi autentikator di HP-mu.',
            toggleText: 'masuk dengan kode pemulihan',
        };
    }, [showRecoveryInput]);

    setLayoutProps({
        title: authConfigContent.title,
        description: authConfigContent.description,
    });

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    };

    return (
        <>
            <Head title="Verifikasi dua langkah" />

            <div className="flex flex-col gap-4">
                <div className="mx-auto grid size-11 place-items-center rounded-2xl bg-[#EFF8FF] ring-1 ring-[#BCE0FF]">
                    <ShieldCheck className="size-5 text-[#0080FF]" />
                </div>

                <Form
                    {...store.form()}
                    className="flex flex-col gap-4"
                    resetOnError
                    resetOnSuccess={!showRecoveryInput}
                >
                    {({ errors, processing, clearErrors }) => (
                        <>
                            {showRecoveryInput ? (
                                <div className={authFieldClassName}>
                                    <Label
                                        htmlFor="recovery_code"
                                        className={authLabelClassName}
                                    >
                                        Kode pemulihan
                                    </Label>
                                    <Input
                                        id="recovery_code"
                                        name="recovery_code"
                                        type="text"
                                        placeholder="cth: abcd-1234-efgh"
                                        autoFocus={showRecoveryInput}
                                        required
                                        autoComplete="one-time-code"
                                        className="h-11 rounded-[10px] border-slate-200 bg-white px-4 text-[15px] shadow-none placeholder:text-slate-400 focus-visible:border-[#0080FF] focus-visible:ring-2 focus-visible:ring-[#0080FF]/20"
                                    />
                                    <InputError
                                        message={errors.recovery_code}
                                        className={authErrorClassName}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <div className={authFieldClassName}>
                                        <span className={authLabelClassName}>
                                            Kode 6 digit
                                        </span>
                                        <div className="flex w-full items-center justify-center pt-1">
                                            <InputOTP
                                                name="code"
                                                maxLength={OTP_MAX_LENGTH}
                                                value={code}
                                                onChange={(value) =>
                                                    setCode(value)
                                                }
                                                disabled={processing}
                                                pattern={REGEXP_ONLY_DIGITS}
                                                autoFocus
                                            >
                                                <InputOTPGroup>
                                                    {Array.from(
                                                        {
                                                            length: OTP_MAX_LENGTH,
                                                        },
                                                        (_, index) => (
                                                            <InputOTPSlot
                                                                key={index}
                                                                index={index}
                                                            />
                                                        ),
                                                    )}
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </div>
                                        <InputError
                                            message={errors.code}
                                            className={`${authErrorClassName} text-center`}
                                        />
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className={authPrimaryButtonClassName}
                                disabled={processing}
                            >
                                {processing && <Spinner />}
                                Lanjut verifikasi
                            </Button>

                            <div className="border-t border-slate-100 pt-4 text-center text-sm text-slate-500">
                                <span>atau kamu bisa </span>
                                <button
                                    type="button"
                                    className={`cursor-pointer ${authMutedLinkClassName}`}
                                    onClick={() =>
                                        toggleRecoveryMode(clearErrors)
                                    }
                                >
                                    {authConfigContent.toggleText}
                                </button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
