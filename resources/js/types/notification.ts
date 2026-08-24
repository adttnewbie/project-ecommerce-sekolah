// Notification type system for frontend - exports both type and config
export type NotificationType =
    | 'order' // Buyer/Seller orders
    | 'stock' // Low stock warnings
    | 'product' // Product approvals/moderation
    | 'payment' // Payment confirmations (future)
    | 'system' // System maintenance/announcements (future)
    | 'promotion'; // Promotional messages (future)

// Icon name mapping (matches lucide-react icon names)
export type NotificationIconName =
    'ShoppingCart' | 'Boxes' | 'Package' | 'CreditCard' | 'Settings' | 'Gift';

// Configuration for each notification type
export interface NotificationTypeConfig {
    icon: NotificationIconName;
    accentColor: string;
    label: string;
}

// Type configuration object - exported for use in components
export const NOTIFICATION_TYPE_CONFIG: Record<
    NotificationType,
    NotificationTypeConfig
> = {
    order: {
        icon: 'ShoppingCart',
        accentColor: '#4f46e5',
        label: 'Pesanan',
    },
    stock: {
        icon: 'Boxes',
        accentColor: '#f59e0b',
        label: 'Stok',
    },
    product: {
        icon: 'Package',
        accentColor: '#10b981',
        label: 'Produk',
    },
    payment: {
        icon: 'CreditCard',
        accentColor: '#3b82f6',
        label: 'Pembayaran',
    },
    system: {
        icon: 'Settings',
        accentColor: '#6b7280',
        label: 'Sistem',
    },
    promotion: {
        icon: 'Gift',
        accentColor: '#ec4899',
        label: 'Promosi',
    },
};
