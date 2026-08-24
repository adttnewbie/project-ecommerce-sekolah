type TimestampFormatOptions = {
    /**
     * Short form for tight surfaces (header popup): "51 mnt", "2 jam",
     * "Kemarin", "17 Agu 2025".
     */
    compact?: boolean;
};

/**
 * Format notification timestamp with mixed localized timestamps.
 *
 * - Recent (same day, < 24 hours): "5 menit yang lalu", "2 jam yang lalu"
 * - Yesterday: "Kemarin"
 * - Older than yesterday: "17 Agu 2025, 14:30"
 * - Very recent (< 1 minute): "Baru saja"
 */
export function formatNotificationTimestamp(
    dateString: string,
    options: TimestampFormatOptions = {},
): string {
    const { compact = false } = options;
    const now = new Date();
    const date = new Date(dateString);

    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Less than 1 minute ago
    if (diffSeconds < 60) {
        return 'Baru saja';
    }

    // Within last hour
    if (diffMinutes < 60) {
        return compact
            ? `${diffMinutes} mnt`
            : `${diffMinutes} menit yang lalu`;
    }

    // Within last 24 hours
    if (diffDays < 1) {
        return compact ? `${diffHours} jam` : `${diffHours} jam yang lalu`;
    }

    // Yesterday
    if (diffDays === 1) {
        return 'Kemarin';
    }

    // Older: Use localized Indonesian date format
    // Example: "17 Agu 2025, 14:30"
    const intlOptions: Intl.DateTimeFormatOptions = compact
        ? { day: 'numeric', month: 'short', year: 'numeric' }
        : {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          };

    return date.toLocaleDateString('id-ID', intlOptions);
}

/**
 * Group notifications by date category.
 * Returns array of { label, items } sorted by newest first.
 */
export function groupNotificationsByDate<T extends { created_at: string }>(
    notifications: T[],
) {
    const groups: Record<string, T[]> = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    notifications.forEach((notification) => {
        const date = new Date(notification.created_at);
        let label: string;

        // Today
        if (date.toDateString() === today.toDateString()) {
            label = 'Hari ini';
        } else if (date.toDateString() === yesterday.toDateString()) {
            // Yesterday
            label = 'Kemarin';
        } else {
            // Older: Use formatted date as label
            const dateOnly = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
            );
            const key = dateOnly.toDateString();

            if (!groups[key]) {
                groups[key] = [];
            }

            // Format for older dates: "Agu 2025" or "17 Agu 2025"
            label = date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        }

        if (!groups[label]) {
            groups[label] = [];
        }

        groups[label].push(notification);
    });

    // Convert to sorted array
    const sortedGroups = Object.entries(groups).map(([label, items]) => ({
        label,
        items,
    }));

    // Sort by priority: Today > Yesterday > Others (chronological)
    const priority: Record<string, number> = {
        'Hari ini': 0,
        Kemarin: 1,
    };

    return sortedGroups.sort((a, b) => {
        const aPriority = priority[a.label] ?? 999;
        const bPriority = priority[b.label] ?? 999;

        return aPriority - bPriority;
    });
}
