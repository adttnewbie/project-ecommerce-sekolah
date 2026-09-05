import { Head } from '@inertiajs/react';
import type { AccountSummary } from '@/components/account/account-menu-config';

export default function AccountIndex({
    accountSummary,
}: {
    accountSummary: AccountSummary;
}) {
    return (
        <>
            <Head title="Akun saya" />
            <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6 sm:px-6">
                <p className="text-sm text-slate-500">
                    Pesanan: {accountSummary.orders_total}
                </p>
            </div>
        </>
    );
}

AccountIndex.layout = null;
