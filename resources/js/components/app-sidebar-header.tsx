import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    Boxes,
    ChevronDown,
    CircleHelp,
    Package,
    Search,
    ShoppingCart,
    Tags,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { HeaderNotificationItem } from '@/components/notifications/header-notification-item';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { login, register } from '@/routes';
import { index as cartIndex } from '@/routes/cart';
import { index as catalogIndex } from '@/routes/catalog';
import { index as buyerOrdersIndex } from '@/routes/orders';
import { index as inventoryIndex } from '@/routes/seller/inventory';
import { index as sellerOrdersIndex } from '@/routes/seller/orders';
import { index as productsIndex } from '@/routes/seller/products';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

const roleLabels: Record<string, string> = {
    admin: 'Super Admin',
    admin_jurusan: 'Admin Jurusan',
    seller: 'Seller',
    buyer: 'Buyer',
    picket_officer: 'Picket Officer',
};

const userMenuClassName =
    'w-56 rounded-[8px] bg-white text-slate-900 ring-slate-200 [&_[data-slot=dropdown-menu-item]]:text-slate-700 [&_[data-slot=dropdown-menu-item]]:focus:bg-slate-100 [&_[data-slot=dropdown-menu-item]]:focus:text-slate-900 [&_[data-slot=dropdown-menu-label]]:text-slate-500 [&_[data-slot=dropdown-menu-separator]]:bg-slate-200';
const notificationMenuClassName =
    'w-80 max-h-[24rem] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300';
const notificationMenuStyle = {
    maxHeight: 'var(--radix-dropdown-menu-content-available-height)',
};

export function getSearchConfig(role: string | undefined, query: string) {
    if (role === 'buyer' || !role) {
        return {
            ariaLabel: 'Pencarian katalog',
            placeholder: 'Cari produk di katalog...',
            targets: [
                {
                    label: 'Katalog',
                    icon: Package,
                    href: catalogIndex({ query: { search: query } }),
                },
            ],
        };
    }

    if (role === 'seller') {
        return {
            ariaLabel: 'Pencarian seller',
            placeholder: 'Cari pesanan, produk, stok...',
            targets: [
                {
                    label: 'Produk',
                    icon: Package,
                    href: productsIndex({ query: { q: query } }),
                },
                {
                    label: 'Inventori',
                    icon: Boxes,
                    href: inventoryIndex({ query: { q: query } }),
                },
                {
                    label: 'Pesanan',
                    icon: ShoppingCart,
                    href: sellerOrdersIndex({ query: { q: query } }),
                },
            ],
        };
    }

    if (role === 'admin') {
        return {
            ariaLabel: 'Pencarian admin',
            placeholder: 'Cari produk, order, user, kategori...',
            targets: [
                {
                    label: 'Produk',
                    icon: Package,
                    href: `/admin/products?q=${encodeURIComponent(query)}`,
                },
                {
                    label: 'Orders',
                    icon: ShoppingCart,
                    href: `/admin/orders?q=${encodeURIComponent(query)}`,
                },
                {
                    label: 'Users',
                    icon: Users,
                    href: `/admin/users?q=${encodeURIComponent(query)}`,
                },
                {
                    label: 'Categories',
                    icon: Tags,
                    href: `/admin/categories?q=${encodeURIComponent(query)}`,
                },
            ],
        };
    }

    return null;
}

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const {
        adminHeader,
        adminJurusanHeader,
        auth,
        buyerHeader,
        picketOfficerHeader,
        sellerHeader,
    } = usePage().props;
    const [search, setSearch] = useState('');
    const getInitials = useInitials();
    const currentBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
    const title = currentBreadcrumb?.title ?? 'Dashboard';
    const userRole = auth.user?.role ? roleLabels[auth.user.role] : undefined;
    const query = search.trim();
    const role = auth.user?.role;
    const searchConfig = getSearchConfig(role, query);

    const submitSearch = (event: React.FormEvent) => {
        event.preventDefault();

        if (query && searchConfig) {
            router.visit(searchConfig.targets[0].href);
        }
    };

    return (
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-4 md:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-4">
                <SidebarTrigger className="-ml-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900" />
                <h1 className="hidden shrink-0 text-2xl font-semibold text-slate-800 lg:block">
                    {title}
                </h1>
                {searchConfig && (
                    <form
                        onSubmit={submitSearch}
                        className="group relative hidden w-full max-w-md xl:ml-4 xl:block"
                    >
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="h-10 rounded-[8px] border-slate-200 bg-slate-50 pr-4 pl-10 text-sm text-slate-700 focus-visible:border-blue-400 focus-visible:bg-white focus-visible:ring-blue-100"
                            placeholder={searchConfig.placeholder}
                            type="search"
                            aria-label={searchConfig.ariaLabel}
                        />
                        {query && (
                            <div className="absolute top-11 z-20 hidden w-full rounded-[8px] border border-slate-200 bg-white p-1 shadow-lg group-focus-within:block">
                                {searchConfig.targets.map(
                                    ({ label, icon: Icon, href }) => (
                                        <Link
                                            key={label}
                                            href={href}
                                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
                                        >
                                            <Icon className="size-4" />
                                            Cari di {label}
                                        </Link>
                                    ),
                                )}
                            </div>
                        )}
                    </form>
                )}
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                {role === 'buyer' ? (
                    <>
                        <Button
                            asChild
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="relative rounded-full text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                        >
                            <Link href={cartIndex()} aria-label="Cart">
                                <ShoppingCart className="size-5" />
                                {Boolean(buyerHeader?.cartItemsCount) && (
                                    <span className="absolute -top-0.5 -right-0.5 min-w-5 rounded-full bg-blue-600 px-1.5 text-center text-[11px] leading-5 font-semibold text-white ring-2 ring-white">
                                        {buyerHeader?.cartItemsCount}
                                    </span>
                                )}
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant="ghost"
                            className="hidden rounded-[8px] px-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-blue-600 md:inline-flex"
                        >
                            <Link href={buyerOrdersIndex()}>Orders</Link>
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="relative rounded-full text-slate-500 hover:bg-slate-100 hover:text-blue-600 aria-expanded:bg-slate-100 aria-expanded:text-blue-600"
                                    aria-label="Notifikasi"
                                >
                                    <Bell className="size-5" />
                                    {buyerHeader?.notifications &&
                                        buyerHeader.notifications.length >
                                            0 && (
                                            <span
                                                className={`absolute top-2 right-2 size-2.5 rounded-full ring-2 ring-white ${buyerHeader.notifications.some((n) => !n.is_read) ? 'bg-red-500' : 'bg-slate-300'}`}
                                            />
                                        )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className={notificationMenuClassName}
                                style={notificationMenuStyle}
                                sideOffset={8}
                            >
                                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[inherit] border-b border-slate-100 bg-white px-3 py-3">
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        Notifikasi
                                    </h3>
                                    {buyerHeader &&
                                        buyerHeader.notifications &&
                                        buyerHeader.notifications.length >
                                            0 && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    router.post(
                                                        '/notifications/mark-all-as-read',
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    );
                                                }}
                                                className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                </div>
                                {buyerHeader &&
                                buyerHeader.notifications?.length ? (
                                    <>
                                        {buyerHeader.notifications.map(
                                            (notification) => (
                                                <HeaderNotificationItem
                                                    key={notification.key}
                                                    notification={notification}
                                                />
                                            ),
                                        )}
                                        <div className="border-t border-slate-100 p-2">
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="sm"
                                                className="w-full text-xs text-blue-600"
                                            >
                                                <Link href="/notifications">
                                                    Lihat semua notifikasi
                                                </Link>
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                                        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-50">
                                            <Bell className="size-5 text-slate-400" />
                                        </div>
                                        <p className="mb-1 text-sm font-medium text-slate-900">
                                            Tidak ada notifikasi baru
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Kabar terbaru soal pesanan Anda akan
                                            muncul di sini
                                        </p>
                                    </div>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                ) : role === 'seller' ? (
                    <>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="relative rounded-full text-slate-500 hover:bg-slate-100 hover:text-blue-600 aria-expanded:bg-slate-100 aria-expanded:text-blue-600"
                                    aria-label="Notifikasi"
                                >
                                    <Bell className="size-5" />
                                    {sellerHeader?.notifications &&
                                        sellerHeader.notifications.length >
                                            0 && (
                                            <span
                                                className={`absolute top-2 right-2 size-2.5 rounded-full ring-2 ring-white ${sellerHeader.notifications.length > 9 ? 'h-5 w-5 rounded-[8px] bg-red-500 p-1' : 'bg-red-500'} ${sellerHeader.notifications.length > 9 ? 'flex items-center justify-center' : ''} ${sellerHeader.notifications.some((n) => n.type === 'order' || n.type === 'stock') ? 'notification-badge-pulse' : ''}`}
                                            >
                                                {sellerHeader.notifications
                                                    .length > 9 && (
                                                    <span className="text-[10px] leading-none font-semibold text-white">
                                                        {Math.floor(
                                                            sellerHeader
                                                                .notifications
                                                                .length / 10,
                                                        )}
                                                        +
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className={notificationMenuClassName}
                                style={notificationMenuStyle}
                                sideOffset={8}
                            >
                                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[inherit] border-b border-slate-100 bg-white px-3 py-3">
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        Notifikasi
                                    </h3>
                                    {sellerHeader &&
                                        sellerHeader.notifications &&
                                        sellerHeader.notifications.length >
                                            0 && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    router.post(
                                                        '/notifications/mark-all-as-read',
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    );
                                                }}
                                                className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                </div>
                                {sellerHeader &&
                                sellerHeader.notifications?.length ? (
                                    sellerHeader.notifications.map(
                                        (notification) => (
                                            <HeaderNotificationItem
                                                key={notification.key}
                                                notification={notification}
                                            />
                                        ),
                                    )
                                ) : (
                                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                                        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-50">
                                            <Bell className="size-5 text-slate-400" />
                                        </div>
                                        <p className="mb-1 text-sm font-medium text-slate-900">
                                            Tidak ada notifikasi baru
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Anda akan melihat notifikasi di sini
                                            ketika ada pembaruan
                                        </p>
                                    </div>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="hidden rounded-full text-slate-500 hover:bg-slate-100 hover:text-blue-600 aria-expanded:bg-slate-100 aria-expanded:text-blue-600 sm:inline-flex"
                                    aria-label="Bantuan"
                                >
                                    <CircleHelp className="size-5" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Panduan Seller</DialogTitle>
                                    <DialogDescription>
                                        Gunakan Produk untuk mengelola katalog,
                                        Inventori untuk memperbarui stok,
                                        Pesanan untuk memproses transaksi, dan
                                        Dashboard untuk memantau ringkasan toko.
                                    </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="hidden rounded-[8px] px-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-blue-600 aria-expanded:bg-slate-100 md:inline-flex"
                                >
                                    Support
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Support</DialogTitle>
                                    <DialogDescription>
                                        {sellerHeader?.supportEmail ? (
                                            <>
                                                Hubungi admin sekolah melalui{' '}
                                                <a
                                                    href={`mailto:${sellerHeader.supportEmail}`}
                                                >
                                                    {sellerHeader.supportEmail}
                                                </a>
                                                .
                                            </>
                                        ) : (
                                            'Hubungi admin sekolah untuk mendapatkan bantuan.'
                                        )}
                                    </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                    </>
                ) : role === 'admin' || role === 'admin_jurusan' ? (
                    <>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="relative rounded-full text-slate-500 hover:bg-slate-100 hover:text-blue-600 aria-expanded:bg-slate-100 aria-expanded:text-blue-600"
                                    aria-label={`Notifikasi ${userRole || 'Admin'}`}
                                >
                                    <Bell className="size-5" />
                                    {adminHeader &&
                                        adminHeader.notifications?.length >
                                            0 && (
                                            <span
                                                className={`absolute top-2 right-2 size-2.5 rounded-full ring-2 ring-white ${adminHeader.notifications.length > 9 ? 'h-5 w-5 rounded-[8px] bg-red-500 p-1' : 'bg-red-500'} ${adminHeader.notifications.length > 9 ? 'flex items-center justify-center' : ''} ${adminHeader.notifications.some((n) => n.type === 'product') ? 'notification-badge-pulse' : ''}`}
                                            >
                                                {adminHeader.notifications
                                                    .length > 9 && (
                                                    <span className="text-[10px] leading-none font-semibold text-white">
                                                        {Math.floor(
                                                            adminHeader
                                                                .notifications
                                                                .length / 10,
                                                        )}
                                                        +
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className={notificationMenuClassName}
                                style={notificationMenuStyle}
                                sideOffset={8}
                            >
                                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[inherit] border-b border-slate-100 bg-white px-3 py-3">
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        Notifikasi {userRole || 'Admin'}
                                    </h3>
                                    {adminHeader &&
                                        adminHeader.notifications &&
                                        adminHeader.notifications.length >
                                            0 && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    router.post(
                                                        '/notifications/mark-all-as-read',
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    );
                                                }}
                                                className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                </div>
                                {adminHeader &&
                                adminHeader.notifications?.length ? (
                                    adminHeader.notifications.map(
                                        (notification) => (
                                            <HeaderNotificationItem
                                                key={notification.key}
                                                notification={notification}
                                            />
                                        ),
                                    )
                                ) : (
                                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                                        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-50">
                                            <Bell className="size-5 text-slate-400" />
                                        </div>
                                        <p className="mb-1 text-sm font-medium text-slate-900">
                                            Tidak ada notifikasi baru
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Anda akan melihat notifikasi di sini
                                            ketika ada pembaruan
                                        </p>
                                    </div>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="hidden rounded-full text-slate-500 hover:bg-slate-100 hover:text-blue-600 aria-expanded:bg-slate-100 aria-expanded:text-blue-600 sm:inline-flex"
                                    aria-label={`Bantuan ${userRole}`}
                                >
                                    <CircleHelp className="size-5" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Panduan {userRole}
                                    </DialogTitle>
                                    <DialogDescription>
                                        Gunakan UP Jurusan untuk mengelola unit,
                                        Titipan untuk approve request seller,
                                        Laporan untuk monitor penjualan, dan
                                        Dashboard untuk overview hari ini.
                                    </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                    </>
                ) : role === 'picket_officer' ? (
                    <>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="relative rounded-full text-slate-500 hover:bg-slate-100 hover:text-blue-600 aria-expanded:bg-slate-100 aria-expanded:text-blue-600"
                                    aria-label={`Notifikasi ${userRole}`}
                                >
                                    <Bell className="size-5" />
                                    {picketOfficerHeader &&
                                        picketOfficerHeader.notifications
                                            ?.length > 0 && (
                                            <span
                                                className={`absolute top-2 right-2 size-2.5 rounded-full ring-2 ring-white ${picketOfficerHeader.notifications.length > 9 ? 'h-5 w-5 rounded-[8px] bg-red-500 p-1' : 'bg-red-500'} ${picketOfficerHeader.notifications.length > 9 ? 'flex items-center justify-center' : ''} ${picketOfficerHeader.notifications.some((n) => n.type === 'order' || n.type === 'payment') ? 'notification-badge-pulse' : ''}`}
                                            >
                                                {picketOfficerHeader
                                                    .notifications.length >
                                                    9 && (
                                                    <span className="text-[10px] leading-none font-semibold text-white">
                                                        {Math.floor(
                                                            picketOfficerHeader
                                                                .notifications
                                                                .length / 10,
                                                        )}
                                                        +
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className={notificationMenuClassName}
                                style={notificationMenuStyle}
                                sideOffset={8}
                            >
                                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[inherit] border-b border-slate-100 bg-white px-3 py-3">
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        Notifikasi {userRole}
                                    </h3>
                                    {picketOfficerHeader &&
                                        picketOfficerHeader.notifications &&
                                        picketOfficerHeader.notifications
                                            .length > 0 && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    router.post(
                                                        '/notifications/mark-all-as-read',
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    );
                                                }}
                                                className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                </div>
                                {picketOfficerHeader &&
                                picketOfficerHeader.notifications?.length ? (
                                    picketOfficerHeader.notifications.map(
                                        (notification) => (
                                            <HeaderNotificationItem
                                                key={notification.key}
                                                notification={notification}
                                            />
                                        ),
                                    )
                                ) : (
                                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                                        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-50">
                                            <Bell className="size-5 text-slate-400" />
                                        </div>
                                        <p className="mb-1 text-sm font-medium text-slate-900">
                                            Tidak ada notifikasi baru
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Anda akan melihat notifikasi di sini
                                            ketika ada pembaruan
                                        </p>
                                    </div>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="hidden rounded-full text-slate-500 hover:bg-slate-100 hover:text-blue-600 aria-expanded:bg-slate-100 aria-expanded:text-blue-600 sm:inline-flex"
                                    aria-label="Bantuan Picket Officer"
                                >
                                    <CircleHelp className="size-5" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Panduan {userRole || 'Picket Officer'}
                                    </DialogTitle>
                                    <DialogDescription>
                                        Gunakan POS untuk transaksi penjualan,
                                        Orders untuk kelola pesanan titipan,
                                        Receiving untuk terima barang dari
                                        seller, Laporan untuk tutup hari, dan
                                        Dashboard untuk overview operasional
                                        hari ini.
                                    </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                    </>
                ) : role === 'admin_jurusan' ? (
                    <>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="relative rounded-full text-slate-500 hover:bg-slate-100 hover:text-blue-600 aria-expanded:bg-slate-100 aria-expanded:text-blue-600"
                                    aria-label={`Notifikasi ${userRole}`}
                                >
                                    <Bell className="size-5" />
                                    {adminJurusanHeader &&
                                        adminJurusanHeader.notifications
                                            ?.length > 0 && (
                                            <span
                                                className={`absolute top-2 right-2 size-2.5 rounded-full ring-2 ring-white ${adminJurusanHeader.notifications.length > 9 ? 'h-5 w-5 rounded-[8px] bg-red-500 p-1' : 'bg-red-500'} ${adminJurusanHeader.notifications.length > 9 ? 'flex items-center justify-center' : ''} ${adminJurusanHeader.notifications.some((n) => n.type === 'order') ? 'notification-badge-pulse' : ''}`}
                                            >
                                                {adminJurusanHeader
                                                    .notifications.length >
                                                    9 && (
                                                    <span className="text-[10px] leading-none font-semibold text-white">
                                                        {Math.floor(
                                                            adminJurusanHeader
                                                                .notifications
                                                                .length / 10,
                                                        )}
                                                        +
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className={notificationMenuClassName}
                                style={notificationMenuStyle}
                                sideOffset={8}
                            >
                                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[inherit] border-b border-slate-100 bg-white px-3 py-3">
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        Notifikasi {userRole}
                                    </h3>
                                    {adminJurusanHeader &&
                                        adminJurusanHeader.notifications &&
                                        adminJurusanHeader.notifications
                                            .length > 0 && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    router.post(
                                                        '/notifications/mark-all-as-read',
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    );
                                                }}
                                                className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                </div>
                                {adminJurusanHeader &&
                                adminJurusanHeader.notifications?.length ? (
                                    adminJurusanHeader.notifications.map(
                                        (notification) => (
                                            <HeaderNotificationItem
                                                key={notification.key}
                                                notification={notification}
                                            />
                                        ),
                                    )
                                ) : (
                                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                                        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-50">
                                            <Bell className="size-5 text-slate-400" />
                                        </div>
                                        <p className="mb-1 text-sm font-medium text-slate-900">
                                            Tidak ada notifikasi baru
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Anda akan melihat notifikasi di sini
                                            ketika ada pembaruan
                                        </p>
                                    </div>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                ) : !auth.user ? (
                    <>
                        <Button
                            asChild
                            variant="ghost"
                            className="hidden rounded-[8px] px-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-blue-600 sm:inline-flex"
                        >
                            <Link href={login()}>Login</Link>
                        </Button>
                        <Button
                            asChild
                            className="h-9 rounded-[8px] bg-blue-600 px-3 text-sm hover:bg-blue-700"
                        >
                            <Link href={register()}>Register</Link>
                        </Button>
                    </>
                ) : null}

                {auth.user && (
                    <div className="hidden h-8 w-px bg-slate-200 md:block" />
                )}

                {auth.user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-10 rounded-[8px] px-1.5 text-slate-900 hover:bg-slate-100 aria-expanded:bg-slate-100 aria-expanded:text-slate-900 md:px-2"
                            >
                                <Avatar className="size-8 overflow-hidden rounded-full border border-slate-200">
                                    <AvatarImage
                                        src={auth.user.avatar}
                                        alt={auth.user.name}
                                    />
                                    <AvatarFallback className="rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                                        {getInitials(auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden min-w-0 flex-col items-start md:flex">
                                    <span className="max-w-36 truncate text-sm leading-none font-medium text-slate-800">
                                        {auth.user.name}
                                    </span>
                                    {userRole && (
                                        <span className="mt-1 max-w-36 truncate text-xs leading-none text-slate-500">
                                            {userRole}
                                        </span>
                                    )}
                                </span>
                                <ChevronDown className="hidden size-4 text-slate-400 md:block" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className={userMenuClassName}
                            align="end"
                        >
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header>
    );
}
