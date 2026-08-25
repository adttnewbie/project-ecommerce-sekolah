import { Link, router, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    Home as HomeIcon,
    Menu,
    PackageCheck,
    Search,
    ShoppingCart,
    X,
} from 'lucide-react';
import { useState } from 'react';
import AppLogo from '@/components/app-logo';
import { NotificationBellTrigger } from '@/components/notifications/notification-bell-trigger';
import { NotificationDropdown } from '@/components/notifications/notification-dropdown';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { home, login, register } from '@/routes';
import { index as cartIndex } from '@/routes/cart';
import { index as ordersIndex } from '@/routes/orders';
import type { NavItem } from '@/types';

const userMenuClassName =
    'w-56 rounded-[14px] bg-white text-slate-900 ring-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.08)] [&_[data-slot=dropdown-menu-item]]:text-slate-700 [&_[data-slot=dropdown-menu-item]]:focus:bg-slate-100 [&_[data-slot=dropdown-menu-item]]:focus:text-slate-900 [&_[data-slot=dropdown-menu-label]]:text-slate-500 [&_[data-slot=dropdown-menu-separator]]:bg-slate-200';

export function AppHeader() {
    const { auth, buyerHeader, notificationBadge } = usePage().props;
    const { isCurrentUrl } = useCurrentUrl();
    const [search, setSearch] = useState(() =>
        typeof window === 'undefined'
            ? ''
            : (new URL(window.location.href).searchParams.get('search') ?? ''),
    );
    const getInitials = useInitials();
    const isBuyer = auth.user?.role === 'buyer';
    const query = search.trim();
    const navItems = getBuyerNavItems(isBuyer);

    const submitSearch = (event: React.FormEvent) => {
        event.preventDefault();

        router.visit(query ? home({ query: { search: query } }) : home());
    };

    const clearSearch = () => {
        setSearch('');
        router.visit(home());
    };

    return (
        <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.05)] backdrop-blur supports-[backdrop-filter]:bg-white/90">
            <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-11 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
                            aria-label="Buka navigasi"
                        >
                            <Menu className="size-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="left"
                        className="flex h-full w-64 flex-col border-slate-200 bg-white p-4 text-slate-900"
                    >
                        <SheetTitle className="sr-only">
                            Navigasi buyer
                        </SheetTitle>
                        <SheetHeader className="mb-6 p-0 text-left">
                            <Link href={home()} className="flex items-center">
                                <AppLogo title="EduCart" subtitle={null} />
                            </Link>
                        </SheetHeader>
                        <nav className="flex flex-col gap-1">
                            {navItems.map((item) => (
                                <BuyerNavLink
                                    key={item.title}
                                    item={item}
                                    isActive={isCurrentUrl(item.href)}
                                />
                            ))}
                        </nav>
                    </SheetContent>
                </Sheet>

                <div className="flex min-w-0 flex-1 items-center gap-2 lg:flex-none">
                    <Link
                        href={home()}
                        prefetch
                        className="flex shrink-0 items-center gap-2 text-slate-900"
                    >
                        <AppLogo title="EduCart" subtitle={null} />
                    </Link>
                </div>

                <form
                    onSubmit={submitSearch}
                    className="relative hidden w-full max-w-2xl md:block"
                >
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-[18px] -translate-y-1/2 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="h-11 rounded-[10px] border-slate-200 bg-white pr-11 pl-10 text-sm text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.05)] focus-visible:border-[#0080FF] focus-visible:ring-[#0080FF]/20"
                        placeholder="Cari produk, kategori, atau brand..."
                        type="search"
                        aria-label="Cari produk, kategori, atau brand"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-[10px] text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-[#0080FF]/20 focus-visible:outline-none"
                            aria-label="Hapus pencarian"
                            title="Hapus pencarian"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </form>

                <nav className="hidden items-center gap-1 lg:flex">
                    {navItems.map((item) => (
                        <BuyerNavLink
                            key={item.title}
                            item={item}
                            isActive={isCurrentUrl(item.href)}
                        />
                    ))}
                </nav>

                <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-2">
                    {isBuyer && (
                        <>
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="relative size-11 rounded-[12px] text-slate-500 hover:bg-slate-100 hover:text-[#0080FF]"
                            >
                                <Link href={cartIndex()} aria-label="Keranjang" title="Keranjang">
                                    <ShoppingCart className="size-5" />
                                    {Boolean(buyerHeader?.cartItemsCount) && (
                                        <span className="absolute -top-1 -right-1 min-w-5 rounded-full bg-[#0080FF] px-1.5 text-center text-[11px] leading-5 font-semibold text-white ring-2 ring-white">
                                            {buyerHeader?.cartItemsCount}
                                        </span>
                                    )}
                                </Link>
                            </Button>

                            <NotificationDropdown
                                notifications={buyerHeader?.notifications}
                                unreadCount={notificationBadge?.count ?? 0}
                                ariaLabel="Notifikasi"
                                emptyTitle="Tidak ada notifikasi baru"
                                emptyText="Kabar terbaru soal pesanan Anda akan muncul di sini"
                            >
                                <NotificationBellTrigger
                                    count={notificationBadge?.count ?? 0}
                                    ariaLabel="Notifikasi"
                                />
                            </NotificationDropdown>
                        </>
                    )}

                    {!auth.user && (
                        <>
                            <Button
                                asChild
                                variant="ghost"
                                className="h-11 px-5"
                            >
                                <Link href={login()}>Login</Link>
                            </Button>
                            <Button asChild className="h-11 px-5">
                                <Link href={register()}>Register</Link>
                            </Button>
                        </>
                    )}

                    {auth.user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-11 rounded-[12px] px-1.5 text-slate-900 hover:bg-slate-100 md:px-2"
                                >
                                    <Avatar className="size-8 overflow-hidden rounded-full border border-slate-200">
                                        <AvatarImage
                                            src={auth.user.avatar}
                                            alt={auth.user.name}
                                        />
                                        <AvatarFallback className="rounded-full bg-[#EFF8FF] text-sm font-semibold text-[#0080FF]">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden max-w-36 truncate text-sm font-medium text-slate-800 md:block">
                                        {auth.user.name}
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
            </div>

            <form
                onSubmit={submitSearch}
                className="relative px-4 pb-3 sm:px-6 md:hidden"
            >
                <Search className="pointer-events-none absolute top-[14px] left-7 size-4 text-slate-400 sm:left-9" />
                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-11 rounded-[10px] border-slate-200 bg-white pr-11 pl-10 text-sm text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.05)] focus-visible:border-[#0080FF] focus-visible:ring-[#0080FF]/20"
                    placeholder="Cari produk, kategori, atau brand..."
                    type="search"
                    aria-label="Cari produk, kategori, atau brand"
                />
                {search && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute top-[8px] right-7 flex size-9 items-center justify-center rounded-[10px] text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 sm:right-9"
                        aria-label="Hapus pencarian"
                        title="Hapus pencarian"
                    >
                        <X className="size-4" />
                    </button>
                )}
            </form>
        </header>
    );
}

function BuyerNavLink({
    item,
    isActive,
}: {
    item: NavItem;
    isActive: boolean;
}) {
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            prefetch
            className={cn(
                'flex h-11 items-center gap-2 rounded-[12px] px-3.5 text-sm font-semibold text-slate-500 transition duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-[#0080FF]/20 focus-visible:outline-none',
                isActive &&
                    'bg-[#EFF8FF] text-[#0080FF] shadow-[inset_0_0_0_1px_rgba(0,128,255,0.12)] hover:bg-[#EFF8FF]',
            )}
        >
            {Icon && <Icon className="size-4" />}
            {item.title}
        </Link>
    );
}

function getBuyerNavItems(isBuyer: boolean): NavItem[] {
    return [
        { title: 'Home', href: home(), icon: HomeIcon },
        ...(isBuyer
            ? [{ title: 'Orders', href: ordersIndex(), icon: PackageCheck }]
            : []),
    ];
}
