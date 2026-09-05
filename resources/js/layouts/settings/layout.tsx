import { Link, router, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Settings,
    ShieldCheck,
    UserRound,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn, toUrl } from '@/lib/utils';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import { dashboard as sellerDashboard } from '@/routes/seller';
import { leave as leaveShoppingMode } from '@/routes/shopping-mode';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profil',
        href: edit(),
        icon: UserRound,
    },
    {
        title: 'Keamanan',
        href: editSecurity(),
        icon: ShieldCheck,
    },
];

const roleLabels: Record<string, string> = {
    admin: 'Super Admin',
    admin_jurusan: 'Admin Jurusan',
    seller: 'Seller',
    buyer: 'Buyer',
    picket_officer: 'Picket Officer',
};

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { auth } = usePage().props;
    const getInitials = useInitials();
    const roleLabel = auth.user?.role
        ? (roleLabels[auth.user.role] ?? auth.user.role)
        : null;

    const navItems: NavItem[] =
        auth.user?.role === 'seller'
            ? [
                  {
                      title: 'Dashboard Seller',
                      href: sellerDashboard(),
                      icon: LayoutDashboard,
                  },
                  ...sidebarNavItems,
              ]
            : sidebarNavItems;

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-6">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <Heading
                    title="Pengaturan"
                    description="Kelola profil dan keamanan akun EduCart"
                />
                {auth.user && (
                    <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm sm:flex">
                        <Settings className="size-3.5 text-slate-400" />
                        <span className="text-xs font-medium text-slate-600">
                            {roleLabel ?? 'Akun'}
                        </span>
                        <span
                            className="size-1 rounded-full bg-slate-300"
                            aria-hidden
                        />
                        <span className="max-w-36 truncate text-xs font-semibold text-slate-900">
                            {auth.user.name}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48 lg:shrink-0">
                    <div className="space-y-4 lg:sticky lg:top-20">
                        {auth.user && (
                            <div className="flex items-center gap-3 rounded-[14px] border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                                <Avatar className="size-10 shrink-0 rounded-full border border-slate-200">
                                    <AvatarImage
                                        src={auth.user.avatar}
                                        alt={auth.user.name}
                                    />
                                    <AvatarFallback className="rounded-full bg-[#EFF8FF] text-sm font-semibold text-[#0080FF]">
                                        {getInitials(auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm leading-none font-semibold text-slate-900">
                                        {auth.user.name}
                                    </p>
                                    <p className="mt-1 truncate text-xs leading-none text-slate-500">
                                        {auth.user.email}
                                    </p>
                                    {roleLabel && (
                                        <Badge
                                            variant="secondary"
                                            className="mt-1.5 h-5 rounded-[6px] bg-slate-100 px-1.5 text-[11px] font-medium text-slate-600 ring-0"
                                        >
                                            {roleLabel}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}

                        <nav
                            className="flex flex-col space-y-1 space-x-0"
                            aria-label="Pengaturan"
                        >
                            <p className="px-3 pb-1 text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
                                Menu
                            </p>
                            {navItems.map((item, index) => {
                                const isActive = isCurrentOrParentUrl(
                                    item.href,
                                );
                                const Icon = item.icon;
                                // "Dashboard Seller" also ends shopping mode so
                                // the session flag never outlives the intent.
                                const exitsShoppingMode =
                                    auth.user?.role === 'seller' &&
                                    toUrl(item.href) ===
                                        toUrl(sellerDashboard());

                                return (
                                    <Button
                                        key={`${toUrl(item.href)}-${index}`}
                                        size="sm"
                                        variant="ghost"
                                        asChild
                                        className={cn(
                                            'h-11 w-full justify-start gap-2 rounded-xl px-3 text-sm font-medium transition-colors duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
                                            isActive
                                                ? 'bg-[#EFF8FF] text-[#0080FF] shadow-[inset_0_0_0_1px_rgba(0,128,255,0.12)] hover:bg-[#EFF8FF] hover:text-[#0080FF]'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                                        )}
                                    >
                                        <Link
                                            href={item.href}
                                            aria-current={
                                                isActive ? 'page' : undefined
                                            }
                                            onClick={
                                                exitsShoppingMode
                                                    ? (event) => {
                                                          event.preventDefault();
                                                          router.post(
                                                              leaveShoppingMode()
                                                                  .url,
                                                          );
                                                      }
                                                    : undefined
                                            }
                                        >
                                            {Icon && (
                                                <Icon className="size-4 shrink-0" />
                                            )}
                                            {item.title}
                                            {isActive && (
                                                <span
                                                    className="ml-auto size-1.5 rounded-full bg-[#0080FF]"
                                                    aria-hidden
                                                />
                                            )}
                                        </Link>
                                    </Button>
                                );
                            })}
                        </nav>

                        <div className="hidden rounded-xl border border-blue-100 bg-[#EFF8FF] p-3 lg:block">
                            <p className="text-xs font-semibold text-[#0A3F76]">
                                Tips keamanan
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-600">
                                Gunakan password kuat dan aktifkan verifikasi 2
                                langkah untuk melindungi akunmu.
                            </p>
                        </div>
                    </div>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-8">{children}</section>
                </div>
            </div>
        </div>
    );
}
