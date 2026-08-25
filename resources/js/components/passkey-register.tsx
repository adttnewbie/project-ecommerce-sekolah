import { usePasskeyRegister } from '@laravel/passkeys/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    onSuccess: () => void;
};

export default function PasskeyRegistration({ onSuccess }: Props) {
    const [name, setName] = useState(() => {
        const ua = navigator.userAgent;

        const browser = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'].find(
            (browser) => new RegExp(browser).test(ua),
        );

        const os = ['iPhone', 'iPad', 'Android', 'Mac', 'Windows'].find((os) =>
            new RegExp(os).test(ua),
        );

        return [browser, os].filter(Boolean).join(' on ') || '';
    });

    const [showForm, setShowForm] = useState(false);
    const { register, isLoading, error, isSupported } = usePasskeyRegister({
        onSuccess: () => {
            setName('');
            setShowForm(false);
            onSuccess();
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            return;
        }

        await register(name);
    };

    const handleCancel = () => {
        setShowForm(false);
        setName('');
    };

    if (!isSupported) {
        return (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-800">
                Browser ini belum mendukung passkey. Coba gunakan Chrome, Safari, atau Edge terbaru.
            </div>
        );
    }

    if (!showForm) {
        return (
            <Button
                variant="outline"
                onClick={() => setShowForm(true)}
                className="h-11 rounded-xl border-slate-200 bg-white px-5 font-semibold text-slate-700 hover:bg-slate-50"
            >
                Tambah passkey
            </Button>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
            <div className="grid gap-2">
                <Label htmlFor="passkey-name" className="text-sm font-medium text-slate-700">
                    Nama passkey
                </Label>
                <Input
                    id="passkey-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: MacBook Pro, iPhone"
                    className="block w-full"
                    autoFocus
                />
                <p className="text-xs leading-4 text-slate-500">
                    Beri nama agar mudah mengenali passkey ini nanti.
                </p>
            </div>

            {error && <InputError message={error} />}

            <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={isLoading || !name.trim()} className="h-11 rounded-xl px-5 font-semibold">
                    {isLoading ? 'Mendaftarkan...' : 'Daftar passkey'}
                </Button>
                <Button type="button" variant="ghost" onClick={handleCancel} className="h-11 rounded-xl">
                    Batal
                </Button>
            </div>
        </form>
    );
}
