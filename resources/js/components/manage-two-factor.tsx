import { Form } from '@inertiajs/react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { disable, enable } from '@/routes/two-factor';

export type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function ManageTwoFactor(props: Props) {
    const requiresConfirmation = props.requiresConfirmation ?? false;
    const twoFactorEnabled = props.twoFactorEnabled ?? false;

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    if (!(props.canManageTwoFactor ?? false)) {
        return null;
    }

    return (
        <>
            <Card className="rounded-[14px] border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3">
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#EFF8FF] ring-1 ring-[#BCE0FF]">
                                <ShieldCheck className="size-5 text-[#0080FF]" />
                            </span>
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                                    Verifikasi 2 langkah (2FA)
                                    {twoFactorEnabled ? (
                                        <Badge className="h-5 rounded-full bg-emerald-50 px-2 py-0 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                                            <CheckCircle2 className="size-3" />
                                            Aktif
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="secondary"
                                            className="h-5 rounded-full bg-slate-100 px-2 py-0 text-[11px] font-medium text-slate-600"
                                        >
                                            Nonaktif
                                        </Badge>
                                    )}
                                </CardTitle>
                                <CardDescription className="mt-1 max-w-[36ch] text-sm leading-5 text-slate-500">
                                    Tambahkan lapisan keamanan. Saat login kamu akan diminta kode 6 digit dari aplikasi autentikator.
                                </CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {twoFactorEnabled ? (
                        <>
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                                <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
                                    <CheckCircle2 className="size-4" />
                                    2FA sudah aktif
                                </p>
                                <p className="mt-1 text-sm leading-5 text-emerald-700">
                                    Kamu akan diminta kode dari aplikasi autentikator di HP setiap kali login. Simpan kode pemulihan di tempat aman.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Form {...disable.form()}>
                                    {({ processing }) => (
                                        <Button
                                            variant="destructive"
                                            type="submit"
                                            disabled={processing}
                                            className="h-11 rounded-xl px-5 font-semibold"
                                        >
                                            {processing ? 'Memproses...' : 'Nonaktifkan 2FA'}
                                        </Button>
                                    )}
                                </Form>
                            </div>

                            <TwoFactorRecoveryCodes
                                recoveryCodesList={recoveryCodesList}
                                fetchRecoveryCodes={fetchRecoveryCodes}
                                errors={errors}
                            />
                        </>
                    ) : (
                        <>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <p className="text-sm leading-5 text-slate-600">
                                    Saat 2FA aktif, kamu perlu memasukkan kode 6 digit dari aplikasi seperti Google Authenticator atau Authy setiap login. Ini menjaga akun tetap aman meski password bocor.
                                </p>
                            </div>

                            <div>
                                {hasSetupData ? (
                                    <Button
                                        onClick={() => setShowSetupModal(true)}
                                        className="h-11 rounded-xl px-5 font-semibold"
                                    >
                                        <ShieldCheck className="size-4" />
                                        Lanjutkan pengaturan
                                    </Button>
                                ) : (
                                    <Form
                                        {...enable.form()}
                                        onSuccess={() => setShowSetupModal(true)}
                                    >
                                        {({ processing }) => (
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="h-11 rounded-xl px-5 font-semibold"
                                            >
                                                {processing ? 'Memproses...' : 'Aktifkan 2FA'}
                                            </Button>
                                        )}
                                    </Form>
                                )}
                                <p className="mt-2 text-xs text-slate-500">
                                    Proses hanya butuh &lt; 1 menit. Siapkan aplikasi autentikator di HP.
                                </p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <TwoFactorSetupModal
                isOpen={showSetupModal}
                onClose={() => setShowSetupModal(false)}
                requiresConfirmation={requiresConfirmation}
                twoFactorEnabled={twoFactorEnabled}
                qrCodeSvg={qrCodeSvg}
                manualSetupKey={manualSetupKey}
                clearSetupData={clearSetupData}
                fetchSetupData={fetchSetupData}
                errors={errors}
            />
        </>
    );
}
