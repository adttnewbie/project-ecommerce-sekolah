<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReviewPendingModeration
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int $reviewId,
        public readonly string $productName,
        public readonly string $productSlug,
        public readonly string $buyerName,
    ) {}

    /**
     * Per-review key: an edited review that re-enters moderation is treated
     * as already announced.
     */
    public function notificationKey(): string
    {
        return "admin-review-pending:{$this->reviewId}";
    }

    public function notificationTitle(): string
    {
        return 'Ulasan menunggu moderasi';
    }

    public function notificationDescription(): string
    {
        return "{$this->buyerName} mengulas {$this->productName}";
    }
}
