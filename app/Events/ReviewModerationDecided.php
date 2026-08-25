<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReviewModerationDecided
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int $reviewId,
        public readonly int $buyerId,
        public readonly string $productName,
        public readonly string $productSlug,
        public readonly string $decision, // 'approved'|'rejected'
        public readonly ?string $reason = null,
    ) {}

    /**
     * Per-decision key: each outcome notifies exactly once per review; an
     * edit that ends in the same decision is treated as already delivered.
     */
    public function notificationKey(): string
    {
        return "review-moderation:{$this->reviewId}:{$this->decision}";
    }

    public function notificationTitle(): string
    {
        return $this->decision === 'approved'
            ? "Ulasan produk {$this->productName} disetujui"
            : "Ulasan produk {$this->productName} ditolak";
    }

    public function notificationDescription(): string
    {
        return $this->decision === 'approved'
            ? 'Ulasan Anda sekarang tampil di halaman produk.'
            : 'Alasan: '.($this->reason ?? 'tidak memenuhi standar.');
    }
}
