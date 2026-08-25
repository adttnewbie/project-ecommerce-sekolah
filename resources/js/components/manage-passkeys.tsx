import { router } from '@inertiajs/react';
import { Fingerprint, KeyRound } from 'lucide-react';
import { destroy } from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyRegistrationController';
import PasskeyItem from '@/components/passkey-item';
import PasskeyRegistration from '@/components/passkey-register';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { Passkey } from '@/types/auth';

export type Props = {
    canManagePasskeys?: boolean;
    passkeys?: Passkey[];
};

const EmptyState = () => {
    return (
        <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                <KeyRound className="h-7 w-7 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-900">Belum ada passkey</p>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-5 text-slate-500">
                Tambahkan passkey agar bisa masuk tanpa password memakai sidik jari atau face unlock di perangkatmu.
            </p>
        </div>
    );
};

export default function ManagePasskeys(props: Props) {
    const passkeys = props.passkeys ?? [];

    const handleDelete = (id: number, onError: () => void) => {
        router.delete(destroy.url(id), {
            preserveScroll: true,
            onError,
        });
    };

    const handleRegisterSuccess = () => {
        router.reload();
    };

    if (!(props.canManagePasskeys ?? false)) {
        return null;
    }

    return (
        <Card className="rounded-[14px] border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
            <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#EFF8FF] ring-1 ring-[#BCE0FF]">
                        <Fingerprint className="size-5 text-[#0080FF]" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <CardTitle className="text-base font-semibold text-slate-900">Passkeys</CardTitle>
                        <CardDescription className="mt-1 text-sm leading-5 text-slate-500">
                            Masuk tanpa password. Gunakan passkey di perangkat yang kompatibel.
                        </CardDescription>
                    </div>
                    {passkeys.length > 0 && (
                        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                            {passkeys.length} passkey
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {passkeys.length > 0 ? (
                        passkeys.map((passkey) => (
                            <PasskeyItem
                                key={passkey.id}
                                passkey={passkey}
                                onDelete={handleDelete}
                            />
                        ))
                    ) : (
                        <EmptyState />
                    )}
                </div>

                <PasskeyRegistration onSuccess={handleRegisterSuccess} />
                <p className="text-xs leading-4 text-slate-500">
                    Passkey disimpan di perangkatmu dan tidak pernah dikirim sebagai password.
                </p>
            </CardContent>
        </Card>
    );
}
