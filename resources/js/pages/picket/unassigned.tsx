import { Head, Link } from '@inertiajs/react';
import { ClipboardList, LogOut, RefreshCw, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function PicketUnassigned() {
    return (
        <>
            <Head title="Picket Belum Ditugaskan" />
            <div className="min-h-[calc(100svh-4rem)] bg-slate-50 p-4 sm:p-6">
                <div className="mx-auto flex max-w-3xl flex-col gap-6">
                    <section>
                        <Badge className="mb-3 rounded-full bg-amber-50 px-3 py-1 text-amber-700 ring-1 ring-amber-200">
                            <ShieldAlert className="size-3.5" />
                            Akses Picket
                        </Badge>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Akun belum ditugaskan ke UP Jurusan
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Dashboard picket, POS, penerimaan barang, order, dan laporan baru bisa digunakan setelah akun ini terhubung
                            dengan satu UP Jurusan. Hubungi admin jurusan untuk assignment.
                        </p>
                    </section>

                    <Card className="gap-0 overflow-hidden rounded-xl border-slate-200 py-0 shadow-sm">
                        <CardHeader className="border-b border-slate-100 p-6">
                            <div className="flex items-start gap-4">
                                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                                    <ClipboardList className="size-5" />
                                </span>
                                <div className="min-w-0">
                                    <CardTitle className="text-lg font-bold tracking-tight text-slate-900">
                                        Hubungi admin jurusan
                                    </CardTitle>
                                    <CardDescription className="mt-1.5 text-sm leading-6 text-slate-600">
                                        Admin jurusan perlu membuat atau menghubungkan akun picket ini ke UP Jurusan yang dikelola. Setelah
                                        assigned, akses picket akan terbuka otomatis tanpa perlu buat akun baru.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-4 p-6 text-sm leading-6 text-slate-600">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                                Status akun:{' '}
                                <span className="font-semibold text-slate-900">Menunggu assignment UP Jurusan</span>
                                <span className="mx-2 text-slate-300">•</span>
                                <span className="text-slate-500">Role: Picket Officer</span>
                            </div>
                            <p className="text-slate-600">
                                Jika assignment baru saja dilakukan, keluar lalu masuk kembali atau refresh halaman ini untuk memuat hak akses
                                terbaru.
                            </p>
                            <div className="flex flex-wrap gap-3 pt-2">
                                <Button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    className="h-11 rounded-xl font-semibold"
                                >
                                    <RefreshCw className="size-4" />
                                    Refresh halaman
                                </Button>
                                <Button asChild variant="outline" className="h-11 rounded-xl">
                                    <Link href="/logout" method="post" as="button">
                                        <LogOut className="size-4" />
                                        Keluar
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <h2 className="text-sm font-semibold text-slate-900">Kenapa saya melihat ini?</h2>
                            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-slate-600">
                                <li>Akun picket dibuat oleh admin jurusan tapi belum di-assign ke UP Jurusan tertentu.</li>
                                <li>Satu UP Jurusan hanya bisa punya satu picket aktif (unique assignment) — cek apakah UP sudah punya picket.</li>
                                <li>Setelah di-assign, kamu akan otomatis redirect ke Dashboard Picket.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

PicketUnassigned.layout = {
    breadcrumbs: [{ title: 'Unassigned', href: '/picket/unassigned' }],
};
