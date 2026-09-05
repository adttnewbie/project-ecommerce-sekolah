import { Link, usePage } from '@inertiajs/react';
import {
    Heart,
    Home as HomeIcon,
    PackageCheck,
    ShoppingCart,
    UserRound,
} from 'lucide-react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import { index as cartIndex } from '@/routes/cart';
import { index as ordersIndex } from '@/routes/orders';
import { edit as profileEdit } from '@/routes/profile';
import { index as wishlistIndex } from '@/routes/wishlist';
import type { NavItem } from '@/types';

type BottomTab = {
    title: string;
    href: NavItem['href'];
    icon: typeof HomeIcon;
    badge?: number;
    primary?: boolean;
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
            primary: true,
        },
        { title: 'Orders', href: ordersIndex(), icon: PackageCheck },
        { title: 'Profile', href: profileEdit(), icon: UserRound },
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
            className="fixed inset-x-0 bottom-0 z-20 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden"
        >
            <div className="mx-auto flex w-full max-w-7xl items-center rounded-2xl border border-slate-200/70 bg-white/95 px-1 py-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.12)] backdrop-blur supports-[backdrop-filter]:bg-white/90">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = isCurrentUrl(tab.href);

                    if (tab.primary) {
                        return (
                            <Link
                                key={tab.title}
                                href={tab.href}
                                prefetch
                                aria-label={tab.title}
                                aria-current={active ? 'page' : undefined}
                                className="flex flex-1 flex-col items-center gap-0.5 focus-visible:ring-2 focus-visible:ring-[#0080FF]/20 focus-visible:outline-none"
                            >
                                <span className="relative -translate-y-3 rounded-full bg-[#0080FF] p-3.5 text-white shadow-[0_8px_16px_rgba(0,128,255,0.35)] ring-4 ring-slate-50 transition active:scale-95">
                                    <Icon className="size-6" aria-hidden />
                                    {Boolean(tab.badge) && (
                                        <span className="absolute -top-1 -right-1 min-w-5 rounded-full bg-rose-500 px-1 text-center text-[10px] leading-4 font-semibold text-white ring-2 ring-white">
                                            {tab.badge}
                                        </span>
                                    )}
                                </span>
                                <span
                                    className={cn(
                                        '-mt-2 text-[11px] font-semibold',
                                        active
                                            ? 'text-[#0080FF]'
                                            : 'text-slate-500',
                                    )}
                                >
                                    {tab.title}
                                </span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={tab.title}
                            href={tab.href}
                            prefetch
                            aria-label={tab.title}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                                'flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-semibold transition focus-visible:ring-2 focus-visible:ring-[#0080FF]/20 focus-visible:outline-none active:scale-95',
                                active
                                    ? 'text-[#0080FF]'
                                    : 'text-slate-500 hover:text-slate-900',
                            )}
                        >
                            <span
                                className={cn(
                                    'rounded-full px-4 py-1',
                                    active && 'bg-[#EFF8FF]',
                                )}
                            >
                                <Icon className="size-5" aria-hidden />
                            </span>
                            {tab.title}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

export function BuyerBottomNavSpacer() {
    return (
        <div
            aria-hidden
            className="h-[calc(5.5rem+env(safe-area-inset-bottom))] shrink-0 lg:hidden"
        />
    );
}
