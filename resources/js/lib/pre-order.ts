export type PreOrderStatus = 'open' | 'closing_soon' | 'closed';

export type PreOrderInfo = {
    is_pre_order: boolean;
    pre_order_status: PreOrderStatus | null;
    pre_order_estimate_days: number | null;
    pre_order_deadline: string | null;
    pre_order_min_quantity: number | null;
};

export type PreOrderStatusMeta = {
    label: string;
    badgeClass: string;
    boxClass: string;
    textClass: string;
};

const STATUS_META: Record<PreOrderStatus, PreOrderStatusMeta> = {
    open: {
        label: 'Pre-Order Dibuka',
        badgeClass: 'bg-blue-50 text-blue-700',
        boxClass: 'border-blue-100 bg-blue-50',
        textClass: 'text-blue-800',
    },
    closing_soon: {
        label: 'Segera Ditutup',
        badgeClass: 'bg-orange-50 text-orange-700',
        boxClass: 'border-orange-100 bg-orange-50',
        textClass: 'text-orange-800',
    },
    closed: {
        label: 'Pre-Order Ditutup',
        badgeClass: 'bg-rose-50 text-rose-700',
        boxClass: 'border-rose-100 bg-rose-50',
        textClass: 'text-rose-800',
    },
};

/**
 * Parse a date-only string ("2026-08-30") as a local date to avoid UTC
 * timezone drift when constructing Date from ISO strings.
 */
function parseDateOnly(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);

    return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
}

export function isPreOrderStatus(value: unknown): value is PreOrderStatus {
    return (
        value === 'open' || value === 'closing_soon' || value === 'closed'
    );
}

export function preOrderStatusMeta(status: PreOrderStatus): PreOrderStatusMeta {
    return STATUS_META[status];
}

/** Resolve status defensively when the backend prop may be absent. */
export function resolvePreOrderStatus(
    info: {
        is_pre_order: boolean;
        pre_order_status?: PreOrderStatus | null;
        pre_order_deadline?: string | null;
    },
): PreOrderStatus | null {
    if (!info.is_pre_order) {
        return null;
    }

    if (isPreOrderStatus(info.pre_order_status)) {
        return info.pre_order_status;
    }

    if (info.pre_order_deadline) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadline = parseDateOnly(info.pre_order_deadline);

        if (today.getTime() > deadline.getTime()) {
            return 'closed';
        }
    }

    return 'open';
}

/** "30 Agu 2026" */
export function formatDateID(dateString: string): string {
    return parseDateOnly(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

/** Whole days from today until the deadline (0 = today). */
export function daysUntil(dateString: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffMs =
        parseDateOnly(dateString).getTime() - today.getTime();

    return Math.round(diffMs / 86_400_000);
}

/** "hari ini", "besok", "3 hari lagi" — or null when far from closing. */
export function deadlineCountdownLabel(
    dateString: string,
    closingSoonDays = 3,
): string | null {
    const days = daysUntil(dateString);

    if (days < 0) {
        return null;
    }

    if (days === 0) {
        return 'berakhir hari ini';
    }

    if (days === 1) {
        return 'berakhir besok';
    }

    if (days <= closingSoonDays) {
        return `berakhir dalam ${days} hari`;
    }

    return null;
}

/** Human summary for the pre-order info box lines. */
export function preOrderDeadlineSummary(
    deadline: string | null,
    closingSoonDays = 3,
): string | null {
    if (!deadline) {
        return null;
    }

    const formatted = formatDateID(deadline);
    const countdown = deadlineCountdownLabel(deadline, closingSoonDays);

    if (countdown === null) {
        const days = daysUntil(deadline);

        return days < 0
            ? `${formatted} (telah berakhir)`
            : formatted;
    }

    return `${formatted} (${countdown})`;
}
