<?php

namespace App\Support;

use App\Models\Notification;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Log;

/**
 * One-shot data repair for pending-order notifications written before the
 * listener switched from the Order id to the seller's OrderItem id in the
 * seller route (which binds an OrderItem).
 */
class NotificationHrefBackfill
{
    private const STALE_HREF_PATTERN = '#^/seller/orders/(\d+)$#';

    private const SELLER_ORDERS_INDEX = '/seller/orders';

    /**
     * Rewrite stored hrefs that point at an Order id instead of the
     * seller's own order item.
     *
     * A parsed id is treated as stale when the matching order contains at
     * least one item owned by the notification recipient; it is left alone
     * when it already resolves to one of the recipient's own items, and
     * rewritten to the orders index when nothing resolves.
     *
     * Returns the number of rows updated.
     */
    public static function run(): int
    {
        $fixed = 0;

        Notification::query()
            ->where('key', 'like', 'order-pending:%')
            ->where('href', 'like', self::SELLER_ORDERS_INDEX.'/%')
            ->orderBy('id')
            ->chunkById(200, function ($notifications) use (&$fixed): void {
                foreach ($notifications as $notification) {
                    if (self::fixNotification($notification)) {
                        $fixed++;
                    }
                }
            });

        return $fixed;
    }

    private static function fixNotification(Notification $notification): bool
    {
        if (preg_match(self::STALE_HREF_PATTERN, $notification->href, $matches) !== 1) {
            return false;
        }

        $parsedId = (int) $matches[1];

        $repairedHref = self::resolveRepairedHref($notification->user_id, $parsedId);

        if ($repairedHref === null || $repairedHref === $notification->href) {
            return false;
        }

        $notification->update(['href' => $repairedHref]);

        Log::info('Repaired pending-order notification href', [
            'notification_id' => $notification->id,
            'user_id' => $notification->user_id,
            'from' => $notification->getOriginal('href'),
            'to' => $repairedHref,
        ]);

        return true;
    }

    private static function resolveRepairedHref(int $sellerId, int $parsedId): ?string
    {
        $ownedBySeller = fn ($query) => $query->where('seller_id', $sellerId);

        $ownItem = OrderItem::query()
            ->where('order_id', $parsedId)
            ->whereHas('product', $ownedBySeller)
            ->orderBy('id')
            ->first();

        if ($ownItem !== null) {
            return "/seller/orders/{$ownItem->id}";
        }

        $linkedItem = OrderItem::query()->find($parsedId);
        $linkedProduct = $linkedItem?->product;

        if ($linkedProduct !== null && $linkedProduct->seller_id === $sellerId) {
            return null;
        }

        return self::SELLER_ORDERS_INDEX;
    }
}
