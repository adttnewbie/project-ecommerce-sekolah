import type { NavItem } from '@/types';

export type AccountSummary = {
    cart_count: number;
    wishlist_count: number;
    orders_total: number;
    orders_by_status: {
        unpaid: number;
        packing: number;
        shipping: number;
        done: number;
    };
};

export type ShortcutHref = NavItem['href'];
