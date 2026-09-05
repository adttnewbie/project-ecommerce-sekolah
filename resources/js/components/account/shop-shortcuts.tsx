import { Link } from '@inertiajs/react';
import { Heart, PackageCheck, ShoppingCart } from 'lucide-react';
import { ACCOUNT_MENU } from './account-menu-config';
import type { AccountSummary } from './account-menu-config';

const ICONS = {
    orders: PackageCheck,
    wishlist: Heart,
    cart: ShoppingCart,
} as const;

export function ShopShortcuts({ summary }: { summary: AccountSummary }) {
    const items = ACCOUNT_MENU.shortcuts(summary);

    return (
        <div className="grid grid-cols-3 gap-2.5">
            {items.map((item) => {
                const Icon = ICONS[item.key];

                return (
                    <Link
                        key={item.key}
                        href={item.href}
                        className="relative flex flex-col items-center gap-1.5 rounded-[12px] border border-slate-200 bg-white px-2 py-3.5 text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition hover:border-[#BCE0FF] hover:text-[#0080FF] focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:outline-none"
                    >
                        {item.count > 0 && (
                            <span className="absolute top-2 right-2 min-w-5 rounded-full bg-[#0080FF] px-1 text-center text-[10px] leading-4 font-bold text-white">
                                {item.count > 99 ? '99+' : item.count}
                            </span>
                        )}
                        <span className="grid size-9 place-items-center rounded-full bg-[#EFF8FF] text-[#0080FF]">
                            <Icon className="size-4" />
                        </span>
                        <span className="text-xs font-semibold">
                            {item.label}
                        </span>
                        <span className="text-[11px] text-slate-500 tabular-nums">
                            {item.count}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
