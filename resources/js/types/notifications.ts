import type { NotificationType } from './notification';

// Frontend notification data structure matching backend API response
export interface Notification {
    id: number;
    type: NotificationType;
    key: string; // Stable identifier from backend
    title: string;
    description: string | null;
    href: string;
    is_read: boolean;
    is_dismissed?: boolean; // Optional, for batch operations
    created_at: string; // ISO 8601 timestamp
    data?: Record<string, unknown>; // Optional metadata payload
}

// Dropdown-specific notification structure (simpler)
export interface NotificationForDropdown extends Pick<
    Notification,
    'key' | 'type' | 'title' | 'description' | 'href' | 'is_read' | 'created_at'
> {
    id?: number;
}

// Notification state for filtering and grouping
export interface NotificationFilterState {
    filter: 'all' | 'unread' | 'read' | NotificationType;
    page?: number;
    perPage?: number;
}

// Paginated notification response from backend
export interface PaginatedNotifications {
    notifications: Notification[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filter: string;
}

// Date group for grouped notifications
export interface NotificationGroup {
    label: string; // "Hari ini", "Kemarin", etc.
    items: Notification[];
}

// Backend props shared via middleware
export interface NotificationBadgeProps {
    count: number;
}

export interface HeaderNotificationData {
    notifications: NotificationForDropdown[];
    supportEmail: string | null;
}
