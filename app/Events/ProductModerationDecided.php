<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProductModerationDecided
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int $productId,
        public readonly string $productName,
        public readonly int $sellerId,
        public readonly string $decision, // 'approved'|'rejected'
        public readonly ?string $reason = null,
    ) {}

    /**
     * Per-decision key: each outcome notifies exactly once per product
     * cycle; a resubmission that ends in the same decision is treated as
     * already delivered.
     */
    public function notificationKey(): string
    {
        return "product-moderation:{$this->productId}:{$this->decision}";
    }

    public function notificationTitle(): string
    {
        return $this->decision === 'approved'
            ? "Produk {$this->productName} disetujui"
            : "Produk {$this->productName} ditolak";
    }

    public function notificationDescription(): string
    {
        return $this->decision === 'approved'
            ? 'Produk Anda sudah tayang di katalog.'
            : 'Alasan: '.($this->reason ?? 'tidak memenuhi standar.');
    }
}
