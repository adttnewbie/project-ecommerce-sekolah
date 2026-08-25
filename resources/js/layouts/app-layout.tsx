import { usePage } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const page = usePage();
    const { auth, shoppingMode } = page.props;
    const isSellerShopping =
        auth.user?.role === 'seller' &&
        shoppingMode === 'buyer' &&
        !page.url.startsWith('/seller');
    const Layout =
        auth.user?.role === 'buyer' || isSellerShopping
            ? AppHeaderLayout
            : AppLayoutTemplate;

    return <Layout breadcrumbs={breadcrumbs}>{children}</Layout>;
}
