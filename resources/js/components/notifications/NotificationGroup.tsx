import type { Notification } from '@/types/notifications';
import { NotificationItem } from './NotificationItem';

export function NotificationGroup({
    label,
    items,
}: {
    label: string;
    items: Array<
        Notification & { isSelectable?: boolean; isSelected?: boolean }
    >;
}) {
    return (
        <div className="mb-8">
            {/* Group header */}
            <h3 className="mb-3 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                {label}
            </h3>

            {/* Items */}
            <div className="space-y-1">
                {items.map((notification) => (
                    <NotificationItem
                        key={notification.key}
                        notification={notification as Notification}
                        showActions={true}
                        isSelectable={notification.isSelectable ?? false}
                        isSelected={notification.isSelected ?? false}
                    />
                ))}
            </div>
        </div>
    );
}
