import type { PageProps as SharedPageProps } from '@inertiajs/core';
import { Head, router, usePage } from '@inertiajs/react';
import {
    CircleHelp,
    FileText,
    Info,
    LogOut,
    MapPin,
    ShieldCheck,
    UserRound,
} from 'lucide-react';
import { useState } from 'react';
import { AccountHeader } from '@/components/account/account-header';
import type { AccountSummary } from '@/components/account/account-menu-config';
import { MenuGroup } from '@/components/account/menu-group';
import { OrderStatusStrip } from '@/components/account/order-status-strip';
import { ShopShortcuts } from '@/components/account/shop-shortcuts';
import { logout } from '@/routes';
import { edit as securityEdit } from '@/routes/security';
import type { Auth } from '@/types';
import ProfileDetail from './profile-detail';

type PageProps = {
    auth: Auth;
} & SharedPageProps;

export default function AccountIndex({
    accountSummary,
}: {
    accountSummary: AccountSummary;
}) {
    const { auth } = usePage<PageProps>().props;
    const url = usePage().url;
    const isDetail =
        new URLSearchParams(url.split('?')[1] ?? '').get('section') ===
        'profil';
    const [loggingOut, setLoggingOut] = useState(false);
    const user = auth.user;

    if (!user) {
        return null;
    }

    const openDetail = () =>
        router.get(
            '/settings/profile',
            { section: 'profil' },
            { preserveState: true, preserveScroll: false },
        );

    if (isDetail) {
        return (
            <>
                <Head title="Profil saya" />
                <ProfileDetail />
            </>
        );
    }

    return (
        <>
            <Head title="Akun saya" />
            <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6 sm:px-6">
                <AccountHeader
                    name={user.name}
                    email={user.email}
                    phone={user.phone}
                    avatar={user.avatar}
                    onOpen={openDetail}
                />
                <ShopShortcuts summary={accountSummary} />
                <OrderStatusStrip summary={accountSummary} />
                <MenuGroup
                    title="Akun saya"
                    items={[
                        {
                            key: 'profil',
                            label: 'Profil',
                            description: 'Nama, email, WhatsApp',
                            icon: UserRound,
                            onClick: openDetail,
                        },
                        {
                            key: 'alamat',
                            label: 'Alamat',
                            description: 'Segera hadir',
                            icon: MapPin,
                            disabled: true,
                        },
                        {
                            key: 'keamanan',
                            label: 'Keamanan',
                            description: 'Password & verifikasi',
                            icon: ShieldCheck,
                            href: securityEdit(),
                        },
                    ]}
                />
                <MenuGroup
                    title="Bantuan & info"
                    items={[
                        {
                            key: 'bantuan',
                            label: 'Pusat Bantuan',
                            description: 'FAQ & hubungi kami',
                            icon: CircleHelp,
                            disabled: true,
                        },
                        {
                            key: 'kebijakan',
                            label: 'Kebijakan',
                            description: 'Syarat & privasi',
                            icon: FileText,
                            disabled: true,
                        },
                        {
                            key: 'tentang',
                            label: 'Tentang EduCart',
                            description: 'Versi aplikasi',
                            icon: Info,
                            disabled: true,
                        },
                    ]}
                />
                <MenuGroup
                    title="Lainnya"
                    items={[
                        {
                            key: 'keluar',
                            label: loggingOut ? 'Keluar...' : 'Keluar',
                            description: 'Keluar dari akun ini',
                            icon: LogOut,
                            onClick: () => {
                                if (loggingOut) {
                                    return;
                                }

                                router.flushAll();
                                setLoggingOut(true);
                                router.post(logout().url, {});
                            },
                        },
                    ]}
                />
            </div>
        </>
    );
}

AccountIndex.layout = null;
