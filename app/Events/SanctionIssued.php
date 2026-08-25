<?php

namespace App\Events;

use App\Enums\SanctionType;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SanctionIssued
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int $sanctionId,
        public readonly int $userId,
        public readonly SanctionType $type,
        public readonly ?string $reason = null,
    ) {}

    public function notificationKey(): string
    {
        return "sanction:{$this->sanctionId}";
    }

    public function notificationTitle(): string
    {
        return match ($this->type) {
            SanctionType::Warning => 'Kamu menerima peringatan',
            SanctionType::CheckoutBan => 'Checkout diblokir sementara',
            SanctionType::ReviewBan => 'Ulasan diblokir sementara',
            SanctionType::PermanentBan => 'Akun diblokir permanen',
            SanctionType::ListingBan => 'Pembuatan produk diblokir sementara',
            SanctionType::SellingSuspension => 'Penjualan disuspen sementara',
        };
    }

    public function notificationDescription(): string
    {
        return $this->reason ?? 'Sanksi diberikan karena pelanggaran ketentuan.';
    }
}
