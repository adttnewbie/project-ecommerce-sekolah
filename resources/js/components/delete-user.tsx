import { Form } from '@inertiajs/react';
import { TriangleAlert } from 'lucide-react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <Card className="overflow-hidden rounded-[14px] border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
            <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-50 ring-1 ring-rose-200">
                        <TriangleAlert className="size-5 text-rose-600" />
                    </span>
                    <div>
                        <CardTitle className="text-base font-semibold text-slate-900">Hapus akun</CardTitle>
                        <CardDescription className="mt-1 text-sm leading-5 text-slate-500">
                            Hapus akun dan semua data terkait secara permanen. Tindakan ini tidak bisa dibatalkan.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-3 rounded-xl border border-rose-200 bg-[#FEF2F2] p-4">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0 text-rose-600" />
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-rose-800">Peringatan</p>
                        <p className="text-sm leading-5 text-rose-700">
                            Akun, pesanan, dan data terkait akan dihapus permanen. Kamu akan keluar dan harus mendaftar ulang untuk kembali.
                        </p>
                    </div>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            data-test="delete-user-button"
                            className="h-11 rounded-xl px-5 font-semibold"
                        >
                            Hapus akun
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogTitle>Hapus akun ini?</DialogTitle>
                        <DialogDescription className="text-sm leading-6 text-slate-600">
                            Tindakan ini akan menghapus akun secara permanen dan tidak dapat dibatalkan. Masukkan password untuk melanjutkan.
                        </DialogDescription>

                        <Form
                            {...ProfileController.destroy.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            onError={() => passwordInput.current?.focus()}
                            resetOnSuccess
                            className="space-y-5 pt-2"
                        >
                            {({ resetAndClearErrors, processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="delete-password"
                                            className="text-sm font-medium text-slate-700"
                                        >
                                            Konfirmasi password
                                        </Label>

                                        <PasswordInput
                                            id="delete-password"
                                            name="password"
                                            ref={passwordInput}
                                            placeholder="Masukkan password saat ini"
                                            autoComplete="current-password"
                                            aria-label="Password untuk hapus akun"
                                        />

                                        <InputError message={errors.password} />
                                        <p className="text-xs text-slate-500">
                                            Kami meminta password untuk memastikan ini benar-benar kamu.
                                        </p>
                                    </div>

                                    <DialogFooter className="gap-2 sm:gap-3">
                                        <DialogClose asChild>
                                            <Button
                                                variant="secondary"
                                                className="h-11 rounded-xl"
                                                onClick={() =>
                                                    resetAndClearErrors()
                                                }
                                            >
                                                Batal
                                            </Button>
                                        </DialogClose>

                                        <Button
                                            variant="destructive"
                                            disabled={processing}
                                            className="h-11 rounded-xl px-5 font-semibold"
                                            asChild
                                        >
                                            <button
                                                type="submit"
                                                data-test="confirm-delete-user-button"
                                            >
                                                {processing ? 'Menghapus...' : 'Ya, hapus akun'}
                                            </button>
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
                <p className="text-xs leading-4 text-slate-500">
                    Butuh bantuan? Hubungi admin sebelum menghapus akun.
                </p>
            </CardContent>
        </Card>
    );
}
