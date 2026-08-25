import type { Auth } from './auth';
import type {
    HeaderNotificationData,
    NotificationBadgeProps,
} from './notifications';

declare module '@inertiajs/core' {
    interface PageProps {
        name: string;
        auth: Auth;
        flash: {
            success?: string;
            error?: string;
            receipt_url?: string;
        };
        notificationBadge: NotificationBadgeProps;
        adminHeader: HeaderNotificationData | null;
        sellerHeader: HeaderNotificationData | null;
        adminJurusanHeader: HeaderNotificationData | null;
        picketOfficerHeader: HeaderNotificationData | null;
        buyerHeader: {
            cartItemsCount: number;
            notifications: HeaderNotificationData['notifications'];
        } | null;
        shoppingMode: string | null;
        sidebarOpen: boolean;
    }
}

declare global {
    interface Window {
        __NOTIF_COUNT__?: number;
        __toasts__?: Array<{
            id: string;
            message: string;
            type: 'success' | 'error' | 'info';
        }>;
    }
}

export {};
