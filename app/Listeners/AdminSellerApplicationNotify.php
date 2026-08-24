<?php

namespace App\Listeners;

use App\Events\SellerApplicationPending;
use App\Support\NotificationDispatch;

class AdminSellerApplicationNotify
{
    /**
     * Handle the event.
     */
    public function handle(SellerApplicationPending $event): void
    {
        NotificationDispatch::toRole(
            'admin',
            'product',
            "admin-seller-app:{$event->applicationId}",
            [
                'title' => "Pengajuan Seller {$event->storeName} menunggu",
                'description' => "{$event->applicantName} mengajukan untuk menjadi seller.",
                'href' => route('admin.seller-applications.index', ['filter_pending' => 1], false),
                'data' => [
                    'application_id' => $event->applicationId,
                    'store_name' => $event->storeName,
                    'source' => 'seller_application',
                ],
            ],
        );
    }
}
