import { Link, usePage } from '@inertiajs/react';
import {
    Heart,
    Home as HomeIcon,
    Menu,
    PackageCheck,
    ShoppingCart,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import { index as cartIndex } from '@/routes/cart';
import { index as ordersIndex } from '@/routes/orders';
import { index as wishlistIndex } from '@/routes/wishlist';
import type { NavItem } from '@/types';

type BottomTab = {
    title: string;
    href: NavItem['href'];
    icon: typeof HomeIcon;
    badge?: number;
};

function getBottomTabs(cartItemsCount: number): BottomTab[] {
    return [
        { title: 'Home', href: home(), icon: HomeIcon },
        { title: 'Wishlist', href: wishlistIndex(), icon: Heart },
        {
            title: 'Cart',
            href: cartIndex(),
            icon: ShoppingCart,
            badge: cartItemsCount,
        },
        { title: 'Orders', href: ordersIndex(), icon: PackageCheck },
    ];
}

function getDrawerNavItems(): NavItem[] {
    return [
        { title: 'Home', href: home(), icon: HomeIcon },
        { title: 'Orders', href: ordersIndex(), icon: PackageCheck },
    ];
}

export function BuyerBottomNav() {
    const { auth, buyerHeader, shoppingMode } = usePage().props;
    const { isCurrentUrl } = useCurrentUrl();
    const canShop =
        auth.user?.role === 'buyer' ||
        (auth.user?.role === 'seller' && shoppingMode === 'buyer');
    const tabs = canShop
        ? getBottomTabs(Number(buyerHeader?.cartItemsCount ?? 0))
        : getBottomTabs(0).slice(0, 1);

    return (
        <nav
            aria-label="Navigasi buyer"
            className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200/70 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_2px_rgba(15,23,42,0.05)] backdrop-blur supports-[backdrop-filter]:bg-white/90 lg:hidden"
        >
            <div className="mx-auto flex w-full max-w-7xl items-stretch px-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = isCurrentUrl(tab.href);

                    return (
                        <Link
                            key={tab.title}
                            href={tab.href}
                            prefetch
                            aria-label={tab.title}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                                'flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold transition focus-visible:ring-2 focus-visible:ring-[#0080FF]/20 focus-visible:outline-none',
                                active
                                    ? 'text-[#0080FF]'
                                    : 'text-slate-500 hover:text-slate-900',
                            )}
                        >
                            <span
                                className={cn(
                                    'relative rounded-full px-4 py-1',
                                    active && 'bg-[#EFF8FF]',
                                )}
                            >
                                <Icon className="size-5" aria-hidden />
                                {Boolean(tab.badge) && (
                                    <span className="absolute -top-1 -right-1 min-w-5 rounded-full bg-[#0080FF] px-1 text-center text-[10px] leading-4 font-semibold text-white ring-2 ring-white">
                                        {tab.badge}
                                    </span>
                                )}
                            </span>
                            {tab.title}
                        </Link>
                    );
                })}

                <Sheet>
                    <SheetTrigger asChild>
                        <button
                            type="button"
                            aria-label="Buka menu"
                            className="flex flex-1 cursor-pointer flex-col items-center gap-1 py-2 text-[11px] font-semibold text-slate-500 transition hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-[#0080FF]/20 focus-visible:outline-none"
                        >
                            <span className="rounded-full px-4 py-1">
                                <Menu className="size-5" aria-hidden />
                            </span>
                            Menu
                        </button>
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
                            {getDrawerNavItems().map((item) => {
                                const Icon = item.icon;
                                const active = isCurrentUrl(item.href);

                                return (
                                    <Link
                                        key={item.title}
                                        href={item.href}
                                        prefetch
                                        className={cn(
                                            'flex h-11 items-center gap-2 rounded-[12px] px-3.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-[#0080FF]/20 focus-visible:outline-none',
                                            active &&
                                                'bg-[#EFF8FF] text-[#0080FF] shadow-[inset_0_0_0_1px_rgba(0,128,255,0.12)] hover:bg-[#EFF8FF]',
                                        )}
                                    >
                                        {Icon && (
                                            <Icon
                                                className="size-4"
                                                aria-hidden
                                            />
                                        )}
                                        {item.title}
                                    </Link>
                                );
                            })}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
}

export function BuyerBottomNavSpacer() {
    return (
        <div
            aria-hidden
            className="h-[calc(4rem+env(safe-area-inset-bottom))] shrink-0 lg:hidden"
        />
    );
}
