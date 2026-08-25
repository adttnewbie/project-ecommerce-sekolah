<?php

namespace App\Events;

use App\Enums\SanctionType;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SanctionLifted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int $sanctionId,
        public readonly int $userId,
        public readonly SanctionType $type,
    ) {}

    public function notificationKey(): string
    {
        return "sanction-lifted:{$this->sanctionId}";
    }

    public function notificationTitle(): string
    {
        return match ($this->type) {
            SanctionType::Warning => 'Peringatan dicabut',
            SanctionType::CheckoutBan => 'Blokir checkout dicabut',
            SanctionType::ReviewBan => 'Blokir ulasan dicabut',
            SanctionType::PermanentBan => 'Blokir permanen dicabut',
            SanctionType::ListingBan => 'Blokir produk dicabut',
            SanctionType::SellingSuspension => 'Suspensi penjualan dicabut',
        };
    }

    public function notificationDescription(): string
    {
        return 'Sanksi telah dihapus oleh admin. Terus jaga transaksi yang baik.';
    }
}
