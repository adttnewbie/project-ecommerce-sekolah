<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SellerApplicationDecided
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int $applicationId,
        public readonly int $userId,
        public readonly string $decision, // 'approved'|'rejected'
        public readonly ?string $storeName = null,
        public readonly ?string $rejectionReason = null,
    ) {}

    /**
     * Per-decision key: each outcome notifies exactly once per application;
     * re-dispatching the same decision is idempotent via firstOrCreate.
     */
    public function notificationKey(): string
    {
        return "seller-application:{$this->applicationId}:{$this->decision}";
    }

    public function notificationTitle(): string
    {
        return $this->decision === 'approved'
            ? 'Pengajuan seller disetujui'
            : 'Pengajuan seller ditolak';
    }

    public function notificationDescription(): string
    {
        if ($this->decision === 'approved') {
            return $this->storeName !== null && trim($this->storeName) !== ''
                ? "Toko {$this->storeName} sudah aktif. Selamat berjualan!"
                : 'Pengajuan seller Anda disetujui. Selamat berjualan!';
        }

        $reason = $this->rejectionReason !== null && trim($this->rejectionReason) !== ''
            ? $this->rejectionReason
            : 'belum memenuhi syarat.';

        $prefix = $this->storeName !== null && trim($this->storeName) !== ''
            ? "Pengajuan toko {$this->storeName} ditolak. "
            : 'Pengajuan seller Anda ditolak. ';

        return $prefix.'Alasan: '.$reason;
    }
}
