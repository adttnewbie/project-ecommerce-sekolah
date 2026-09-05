import { Link } from '@inertiajs/react';
import { Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export function SellerCta() {
    return (
        <Card className="rounded-[14px] border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
            <CardHeader>
                <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 ring-1 ring-emerald-200">
                        <Store className="size-5 text-emerald-600" />
                    </span>
                    <div>
                        <CardTitle className="text-base font-semibold text-slate-900">
                            Akun seller
                        </CardTitle>
                        <CardDescription className="mt-1 line-clamp-none text-sm leading-5 text-slate-500">
                            Ajukan akun seller jika ingin mulai menjual produk
                            di EduCart.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-slate-900">
                                Ajukan jadi seller
                            </h3>
                            <p className="mt-1 text-sm leading-5 text-slate-500">
                                Admin akan meninjau data toko sebelum akun kamu
                                berubah menjadi seller.
                            </p>
                        </div>
                        <Button
                            asChild
                            className="h-11 w-full shrink-0 rounded-xl px-5 font-semibold sm:w-auto"
                        >
                            <Link href="/seller-application">
                                Buka pengajuan
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
