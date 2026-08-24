<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SellerApplicationPending
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int $applicationId,
        public readonly string $storeName,
        public readonly string $applicantName,
    ) {}

    public function notificationKey(): string
    {
        return "admin-seller-application:{$this->applicationId}";
    }

    public function notificationTitle(): string
    {
        return "Pengajuan seller {$this->storeName} menunggu persetujuan";
    }

    public function notificationDescription(): string
    {
        return "{$this->applicantName} mengajukan untuk menjadi seller.";
    }

    public function notificationHref(): string
    {
        return '/admin/seller-applications?filter=pending';
    }
}
