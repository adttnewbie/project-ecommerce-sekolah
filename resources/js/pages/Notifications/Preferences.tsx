import type { PageProps as SharedPageProps } from '@inertiajs/core';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Boxes,
    CheckCircle2,
    CreditCard,
    Gift,
    Info,
    Loader2,
    Package,
    ShoppingCart,
    Star,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { NotificationEmptyState } from '@/components/notifications/NotificationEmptyState';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { index as notificationsIndex } from '@/routes/notifications';
import type { NotificationTypeStyle } from '@/types/notification';
import { NOTIFICATION_TYPE_STYLE } from '@/types/notification';
import type {
    NotificationPreferenceType,
    NotificationPreferencesPageProps,
} from '@/types/notifications';

type PreferencesPageProps = SharedPageProps & NotificationPreferencesPageProps;

interface PreferencesFormData {
    preferences: Record<string, { in_app_enabled: boolean }>;
}

interface PreferenceMeta {
    label: string;
    description: string;
    icon: LucideIcon;
}

/** Urutan tampil mengikuti $allTypes di NotificationPreferencesController. */
const PREFERENCE_ORDER: NotificationPreferenceType[] = [
    'order',
    'stock',
    'product',
    'review',
    'payment',
    'system',
    'promotion',
];

const PREFERENCE_META: Record<NotificationPreferenceType, PreferenceMeta> = {
    order: {
        label: 'Pesanan',
        description:
            'Status pesanan Anda — pembayaran, pengiriman, sampai selesai.',
        icon: ShoppingCart,
    },
    stock: {
        label: 'Stok',
        description: 'Peringatan saat stok produk menipis atau habis.',
        icon: Boxes,
    },
    product: {
        label: 'Produk',
        description: 'Persetujuan dan pembaruan info produk.',
        icon: Package,
    },
    review: {
        label: 'Ulasan',
        description: 'Ulasan dan penilaian baru untuk produk.',
        icon: Star,
    },
    payment: {
        label: 'Pembayaran',
        description: 'Konfirmasi pembayaran dan status transaksi.',
        icon: CreditCard,
    },
    system: {
        label: 'Sistem',
        description: 'Pengumuman penting dan info pemeliharaan aplikasi.',
        icon: Info,
    },
    promotion: {
        label: 'Promosi',
        description: 'Promo, diskon, dan penawaran menarik dari EduCart.',
        icon: Gift,
    },
};

function toBoolean(value: boolean | number | undefined): boolean {
    if (value === true || value === 1) {
        return true;
    }

    return false;
}

function buildInitialPreferences(
    preferences:
        | Record<string, { in_app_enabled?: boolean | number } | undefined>
        | undefined,
): PreferencesFormData['preferences'] {
    const initial: PreferencesFormData['preferences'] = {};

    for (const type of PREFERENCE_ORDER) {
        initial[type] = {
            in_app_enabled: toBoolean(
                preferences?.[type]?.in_app_enabled ?? true,
            ),
        };
    }

    return initial;
}

function preferenceStyle(type: string): NotificationTypeStyle {
    return (
        (NOTIFICATION_TYPE_STYLE as Record<string, NotificationTypeStyle>)[
            type
        ] ?? NOTIFICATION_TYPE_STYLE.system
    );
}

export default function NotificationPreferencesPage() {
    const { props } = usePage<PreferencesPageProps>();
    const [submitFailed, setSubmitFailed] = useState(false);

    const form = useForm<PreferencesFormData>({
        preferences: buildInitialPreferences(props.preferences),
    });

    const entries = PREFERENCE_ORDER.filter((type) =>
        Object.hasOwn(form.data.preferences, type),
    );

    const handleToggle = (type: string, value: boolean) => {
        setSubmitFailed(false);
        form.setData('preferences', {
            ...form.data.preferences,
            [type]: { in_app_enabled: value },
        });
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Cegah double submit saat request masih berjalan.
        if (form.processing) {
            return;
        }

        setSubmitFailed(false);

        // Belum ada helper Wayfinder untuk notifications.preferences
        // (lihat resources/js/routes/notifications/index.ts) — pakai path
        // literal yang sama seperti halaman Notifications index.
        form.put('/notifications/preferences', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Pengaturan notifikasi disimpan');
            },
            onError: () => {
                setSubmitFailed(true);
                toast.error(
                    'Gagal menyimpan. Periksa koneksi Anda, lalu coba lagi.',
                );
            },
        });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Pengaturan Notifikasi" />

            {/* Sticky Header */}
            <header className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
                <div className="mx-auto flex h-16 max-w-3xl items-center gap-2 px-4 sm:px-6">
                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    >
                        <Link
                            href={notificationsIndex().url}
                            aria-label="Kembali ke notifikasi"
                        >
                            <ArrowLeft className="size-5" />
                        </Link>
                    </Button>
                    <div className="min-w-0">
                        <h1 className="truncate text-xl font-semibold text-slate-900 sm:text-2xl">
                            Pengaturan Notifikasi
                        </h1>
                        <p className="truncate text-sm text-slate-500">
                            Atur notifikasi yang ingin Anda terima
                        </p>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
                {entries.length === 0 ? (
                    <Card>
                        <CardContent>
                            <NotificationEmptyState
                                title="Belum ada pengaturan notifikasi"
                                description="Pengaturan Anda tidak dapat dimuat saat ini. Muat ulang halaman untuk mencoba lagi."
                                ctaLabel="Muat Ulang"
                                ctaHref="/notifications/preferences"
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Catatan in-app only */}
                        <Alert className="border-[#BCE0FF] bg-[#EFF8FF]">
                            <Info className="size-4 text-[#0080FF]" />
                            <AlertTitle className="text-slate-900">
                                Notifikasi hanya di dalam aplikasi (in-app)
                            </AlertTitle>
                            <AlertDescription className="text-slate-600">
                                Notifikasi email belum tersedia, jadi pengaturan
                                di sini hanya mengatur notifikasi di dalam
                                aplikasi EduCart.
                            </AlertDescription>
                        </Alert>

                        {/* Error submit + Coba Lagi */}
                        {submitFailed && (
                            <Alert variant="destructive">
                                <Info className="size-4" />
                                <AlertTitle>
                                    Gagal menyimpan perubahan
                                </AlertTitle>
                                <AlertDescription>
                                    Periksa koneksi internet Anda, lalu tekan
                                    Coba Lagi.
                                </AlertDescription>
                                <div className="col-start-2 mt-2">
                                    <Button
                                        type="submit"
                                        size="sm"
                                        variant="outline"
                                        disabled={form.processing}
                                        className="h-11 border-rose-200 bg-white px-4 text-rose-700 hover:bg-rose-50 hover:text-rose-700"
                                    >
                                        {form.processing ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : null}
                                        Coba Lagi
                                    </Button>
                                </div>
                            </Alert>
                        )}

                        {/* Daftar toggle per type */}
                        <Card>
                            <CardContent
                                className="p-0"
                                aria-busy={form.processing}
                            >
                                <ul className="divide-y divide-slate-100">
                                    {entries.map((type) => {
                                        const meta = PREFERENCE_META[type];
                                        const MetaIcon = meta.icon;
                                        const style = preferenceStyle(type);
                                        const enabled =
                                            form.data.preferences[type]
                                                ?.in_app_enabled ?? true;
                                        const error =
                                            form.errors[
                                                `preferences.${type}.in_app_enabled` as keyof typeof form.errors
                                            ];

                                        return (
                                            <li
                                                key={type}
                                                className={cn(
                                                    'px-4 sm:px-6',
                                                    form.processing &&
                                                        'opacity-60',
                                                )}
                                            >
                                                <div className="flex items-center gap-3 py-2">
                                                    <span
                                                        className="flex size-11 shrink-0 items-center justify-center rounded-[12px]"
                                                        style={{
                                                            backgroundColor:
                                                                style.iconBg,
                                                            color: style.iconColor,
                                                        }}
                                                        aria-hidden="true"
                                                    >
                                                        <MetaIcon className="size-5" />
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block text-sm font-semibold text-slate-900">
                                                            {meta.label}
                                                        </span>
                                                        <span className="mt-0.5 block text-sm leading-5 text-slate-500">
                                                            {meta.description}
                                                        </span>
                                                    </span>
                                                    <button
                                                        type="button"
                                                        role="switch"
                                                        aria-checked={enabled}
                                                        aria-label={meta.label}
                                                        disabled={
                                                            form.processing
                                                        }
                                                        onClick={() =>
                                                            handleToggle(
                                                                type,
                                                                !enabled,
                                                            )
                                                        }
                                                        className="flex min-h-11 min-w-11 shrink-0 items-center justify-end rounded-[12px] transition focus-visible:ring-2 focus-visible:ring-[#0080FF]/40 focus-visible:outline-none disabled:cursor-not-allowed"
                                                    >
                                                        <span
                                                            className={cn(
                                                                'inline-flex h-7 w-12 items-center rounded-full px-1 transition-colors duration-200',
                                                                enabled
                                                                    ? 'justify-end bg-[#0080FF]'
                                                                    : 'justify-start bg-slate-200',
                                                            )}
                                                        >
                                                            <span className="size-5 rounded-full bg-white shadow" />
                                                        </span>
                                                    </button>
                                                </div>
                                                {typeof error === 'string' &&
                                                error.length > 0 ? (
                                                    <p
                                                        role="alert"
                                                        className="pb-3 pl-14 text-sm text-rose-600"
                                                    >
                                                        {error}
                                                    </p>
                                                ) : null}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Sticky action bar — satu CTA utama */}
                        <div className="sticky bottom-0 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
                            <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row sm:items-center">
                                {form.recentlySuccessful && !form.processing ? (
                                    <p
                                        role="status"
                                        className="flex items-center gap-1.5 text-sm font-medium text-emerald-600"
                                    >
                                        <CheckCircle2 className="size-4" />
                                        Perubahan tersimpan
                                    </p>
                                ) : null}
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="h-11 w-full sm:ml-auto sm:w-auto sm:px-6"
                                >
                                    {form.processing ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        'Simpan Perubahan'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
}
