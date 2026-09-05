import type { PageProps as SharedPageProps } from '@inertiajs/core';
import { Head, usePage } from '@inertiajs/react';
import BuyerProfile from '@/components/settings/buyer-profile';
import ProfileForm from '@/components/settings/profile-form';
import { edit } from '@/routes/profile';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
} & SharedPageProps;

export default function Profile() {
    const { auth } = usePage<PageProps>().props;
    const isBuyer = auth.user?.role === 'buyer';

    return (
        <>
            <Head title={isBuyer ? 'Akun saya' : 'Pengaturan profil'} />
            <h1 className="sr-only">
                {isBuyer ? 'Akun saya' : 'Pengaturan profil'}
            </h1>
            {isBuyer ? <BuyerProfile /> : <ProfileForm />}
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan profil',
            href: edit(),
        },
    ],
};
