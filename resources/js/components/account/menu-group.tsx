import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NavItem } from '@/types';

export type MenuRow = {
    key: string;
    label: string;
    description: string;
    href?: NavItem['href'];
    icon: LucideIcon;
    disabled?: boolean;
    onClick?: () => void;
};

export function MenuGroup({
    title,
    items,
}: {
    title: string;
    items: MenuRow[];
}) {
    return (
        <section
            aria-label={title}
            className="rounded-[14px] border border-slate-200 bg-white py-1 shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
        >
            <h2 className="px-4 pt-3 pb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">
                {title}
            </h2>
            {items.map((item) => {
                const Icon = item.icon;
                const cls =
                    'flex items-center gap-3 rounded-[12px] px-3 py-3 transition focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:outline-none ' +
                    (item.disabled
                        ? 'cursor-not-allowed opacity-50'
                        : 'hover:bg-slate-50');
                const inner = (
                    <>
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600">
                            <Icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-slate-900">
                                {item.label}
                            </span>
                            <span className="block truncate text-xs text-slate-500">
                                {item.description}
                            </span>
                        </span>
                        <ChevronRight
                            className="size-4 shrink-0 text-slate-400"
                            aria-hidden
                        />
                    </>
                );

                if (item.disabled || !item.href) {
                    return (
                        <button
                            key={item.key}
                            type="button"
                            disabled={item.disabled}
                            onClick={item.onClick}
                            aria-disabled={item.disabled}
                            className={cls}
                        >
                            {inner}
                        </button>
                    );
                }

                return (
                    <Link
                        key={item.key}
                        href={item.href}
                        onClick={
                            item.onClick
                                ? (e) => {
                                      e.preventDefault();
                                      item.onClick?.();
                                  }
                                : undefined
                        }
                        className={cls}
                    >
                        {inner}
                    </Link>
                );
            })}
        </section>
    );
}
