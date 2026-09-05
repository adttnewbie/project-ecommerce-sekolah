import { Link, usePage } from '@inertiajs/react';
import { Bell, Home as HomeIcon, UserRound } from 'lucide-react';
import { NotificationDropdown } from '@/components/notifications/notification-dropdown';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import { edit as profileEdit } from '@/routes/profile';
import type { NavItem } from '@/types';

type BottomTab = {
    title: string;
    href: NavItem['href'];
    icon: typeof HomeIcon;
};

const TABS: BottomTab[] = [
    { title: 'Home', href: home(), icon: HomeIcon },
    { title: 'Profile', href: profileEdit(), icon: UserRound },
];

export function BuyerBottomNav() {
    const { auth, buyerHeader, notificationBadge, shoppingMode } =
        usePage().props;
    const { isCurrentUrl } = useCurrentUrl();
    const canShop =
        auth.user?.role === 'buyer' ||
        (auth.user?.role === 'seller' && shoppingMode === 'buyer');

    if (!canShop) {
        return null;
    }

    const unreadCount = Number(notificationBadge?.count ?? 0);

    return (
        <nav
            aria-label="Navigasi buyer"
            className="fixed inset-x-0 bottom-0 z-20 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden"
        >
            <div className="mx-auto flex w-full max-w-7xl items-center rounded-2xl border border-slate-200/70 bg-white/95 px-1 py-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.12)] backdrop-blur supports-[backdrop-filter]:bg-white/90">
                <BottomLink tab={TABS[0]} active={isCurrentUrl(TABS[0].href)} />

                <NotificationDropdown
                    notifications={buyerHeader?.notifications}
                    unreadCount={unreadCount}
                    ariaLabel="Notifikasi"
                    emptyTitle="Tidak ada notifikasi baru"
                    emptyText="Kabar terbaru soal pesanan Anda akan muncul di sini"
                >
                    <div
                        aria-label={
                            unreadCount > 0
                                ? `Notifikasi (${unreadCount} belum dibaca)`
                                : 'Notifikasi'
                        }
                        className="flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-semibold text-slate-500 transition hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-[#0080FF]/20 focus-visible:outline-none active:scale-95"
                    >
                        <span className="relative rounded-full px-4 py-1">
                            <Bell className="size-5" aria-hidden />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-2 min-w-5 rounded-full bg-[#DC2626] px-1 text-center text-[10px] leading-4 font-semibold text-white ring-2 ring-white">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </span>
                        Notifikasi
                    </div>
                </NotificationDropdown>

                <BottomLink tab={TABS[1]} active={isCurrentUrl(TABS[1].href)} />
            </div>
        </nav>
    );
}

function BottomLink({ tab, active }: { tab: BottomTab; active: boolean }) {
    const Icon = tab.icon;

    return (
        <Link
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
}

export function BuyerBottomNavSpacer() {
    return (
        <div
            aria-hidden
            className="h-[calc(5.5rem+env(safe-area-inset-bottom))] shrink-0 lg:hidden"
        />
    );
}
