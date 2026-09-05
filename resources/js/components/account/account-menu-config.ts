import { index as cartIndex } from '@/routes/cart';
import { index as ordersIndex } from '@/routes/orders';
import { index as wishlistIndex } from '@/routes/wishlist';
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

export type ShortcutItem = {
    key: 'orders' | 'wishlist' | 'cart';
    label: string;
    count: number;
    href: NavItem['href'];
};

export type StripItem = {
    key: 'unpaid' | 'packing' | 'shipping' | 'done';
    label: string;
    count: number;
};

export const ACCOUNT_MENU = {
    shortcuts: (s: AccountSummary): ShortcutItem[] => [
        {
            key: 'orders',
            label: 'Pesanan',
            count: s.orders_total,
            href: ordersIndex(),
        },
        {
            key: 'wishlist',
            label: 'Wishlist',
            count: s.wishlist_count,
            href: wishlistIndex(),
        },
        {
            key: 'cart',
            label: 'Keranjang',
            count: s.cart_count,
            href: cartIndex(),
        },
    ],
    orderStrip: (s: AccountSummary): StripItem[] => [
        {
            key: 'unpaid',
            label: 'Belum Bayar',
            count: s.orders_by_status.unpaid,
        },
        {
            key: 'packing',
            label: 'Dikemas',
            count: s.orders_by_status.packing,
        },
        {
            key: 'shipping',
            label: 'Dikirim',
            count: s.orders_by_status.shipping,
        },
        { key: 'done', label: 'Selesai', count: s.orders_by_status.done },
    ],
};
