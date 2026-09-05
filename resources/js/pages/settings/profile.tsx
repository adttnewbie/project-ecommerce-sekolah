import { Head } from '@inertiajs/react';
import ProfileForm from '@/components/settings/profile-form';
import { edit } from '@/routes/profile';

export default function Profile() {
    return (
        <>
            <Head title="Pengaturan profil" />
            <h1 className="sr-only">Pengaturan profil</h1>
            <ProfileForm />
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
