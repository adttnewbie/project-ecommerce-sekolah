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

/**
 * EduCart Design System semantic mapping:
 * - primary #0080FF → order/payment/promotion (aksi utama, Info)
 * - warning #EA580C bg #FFF7ED → stock (stok hampir habis)
 * - success #16A34A bg #ECFDF3 → product (moderasi berhasil)
 * - neutral slate → system
 * Sesuai design.md:115-130 Aturan penggunaan warna.
 */
export interface NotificationTypeStyle {
    accent: string;
    bg: string;
    border: string;
    iconBg: string;
    iconColor: string;
}

export const NOTIFICATION_TYPE_STYLE: Record<
    NotificationType,
    NotificationTypeStyle
> = {
    order: {
        accent: '#0080FF',
        bg: '#EFF8FF',
        border: '#BCE0FF',
        iconBg: '#EFF8FF',
        iconColor: '#0080FF',
    },
    payment: {
        accent: '#0080FF',
        bg: '#EFF8FF',
        border: '#BCE0FF',
        iconBg: '#EFF8FF',
        iconColor: '#0080FF',
    },
    promotion: {
        accent: '#0080FF',
        bg: '#EFF8FF',
        border: '#BCE0FF',
        iconBg: '#EFF8FF',
        iconColor: '#0080FF',
    },
    stock: {
        accent: '#EA580C',
        bg: '#FFF7ED',
        border: '#FED7AA',
        iconBg: '#FFF7ED',
        iconColor: '#EA580C',
    },
    product: {
        accent: '#16A34A',
        bg: '#ECFDF3',
        border: '#BBF7D0',
        iconBg: '#ECFDF3',
        iconColor: '#16A34A',
    },
    system: {
        accent: '#64748B',
        bg: '#F8FAFC',
        border: '#E2E8F0',
        iconBg: '#F1F5F9',
        iconColor: '#64748B',
    },
};

// Type configuration object - exported for use in components
export const NOTIFICATION_TYPE_CONFIG: Record<
    NotificationType,
    NotificationTypeConfig
> = {
    order: {
        icon: 'ShoppingCart',
        accentColor: NOTIFICATION_TYPE_STYLE.order.accent,
        label: 'Pesanan',
    },
    stock: {
        icon: 'Boxes',
        accentColor: NOTIFICATION_TYPE_STYLE.stock.accent,
        label: 'Stok',
    },
    product: {
        icon: 'Package',
        accentColor: NOTIFICATION_TYPE_STYLE.product.accent,
        label: 'Produk',
    },
    payment: {
        icon: 'CreditCard',
        accentColor: NOTIFICATION_TYPE_STYLE.payment.accent,
        label: 'Pembayaran',
    },
    system: {
        icon: 'Settings',
        accentColor: NOTIFICATION_TYPE_STYLE.system.accent,
        label: 'Sistem',
    },
    promotion: {
        icon: 'Gift',
        accentColor: NOTIFICATION_TYPE_STYLE.promotion.accent,
        label: 'Promosi',
    },
};
