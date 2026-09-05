import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { index as ordersIndex } from '@/routes/orders';
import { ACCOUNT_MENU  } from './account-menu-config';
import type {AccountSummary} from './account-menu-config';

export function OrderStatusStrip({ summary }: { summary: AccountSummary }) {
    const items = ACCOUNT_MENU.orderStrip(summary);

    return (
        <section
            aria-label="Pesanan saya"
            className="rounded-[14px] border border-slate-200 bg-white p-2 shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
        >
            <Link
                href={ordersIndex()}
                className="flex items-center justify-between rounded-[10px] px-3 py-2.5 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:outline-none"
            >
                <span className="text-sm font-bold text-slate-900">
                    Pesanan Saya
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                    Lihat semua <ChevronRight className="size-3.5" />
                </span>
            </Link>
            <div className="grid grid-cols-4 gap-1">
                {items.map((s) => (
                    <Link
                        key={s.key}
                        href={ordersIndex()}
                        className="flex flex-col items-center gap-1 rounded-[10px] px-1 py-2.5 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:outline-none"
                    >
                        <span className="text-sm font-bold text-slate-900 tabular-nums">
                            {s.count > 99 ? '99+' : s.count}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                            {s.label}
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
