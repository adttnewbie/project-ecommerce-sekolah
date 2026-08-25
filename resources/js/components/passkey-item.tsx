import { KeyRound, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import type { Passkey } from '@/types/auth';

type Props = {
    passkey: Passkey;
    onDelete: (id: number, onError: () => void) => void;
};

export default function PasskeyItem({ passkey, onDelete }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        onDelete(passkey.id, () => setIsDeleting(false));
    };

    return (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4 last:border-b-0">
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 ring-1 ring-slate-200">
                    <KeyRound className="h-5 w-5 text-slate-500" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold tracking-tight text-slate-900">
                            {passkey.name}
                        </p>
                        {passkey.authenticator && (
                            <span className="inline-flex items-center gap-1 rounded-[6px] bg-slate-100 px-2 py-0.5 text-[11px] font-medium tracking-wide text-slate-600 uppercase ring-1 ring-slate-200 ring-inset">
                                {passkey.authenticator}
                            </span>
                        )}
                    </div>
                    <p className="text-xs leading-4 text-slate-500 sm:text-sm">
                        Ditambahkan {passkey.created_at_diff}
                        {passkey.last_used_at_diff && (
                            <>
                                <span className="mx-1 text-slate-300">•</span>
                                Terakhir dipakai {passkey.last_used_at_diff}
                            </>
                        )}
                    </p>
                </div>
            </div>

            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        aria-label={`Hapus passkey ${passkey.name}`}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Hapus</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogTitle>Hapus passkey?</DialogTitle>
                    <DialogDescription className="text-sm leading-6 text-slate-600">
                        Kamu akan menghapus passkey &quot;{passkey.name}&quot;. Kamu tidak akan bisa masuk memakai passkey ini lagi.
                    </DialogDescription>
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="secondary" className="h-11 rounded-xl">
                                Batal
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="h-11 rounded-xl px-5 font-semibold"
                        >
                            {isDeleting ? 'Menghapus...' : 'Hapus passkey'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
