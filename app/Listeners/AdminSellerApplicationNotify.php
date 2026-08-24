<?php

namespace App\Listeners;

use App\Events\SellerApplicationPending;
use App\Models\Notification;
use Illuminate\Support\Facades\Log;

class AdminSellerApplicationNotify
{
    /**
     * Handle the event.
     */
    public function handle(SellerApplicationPending $event): void
    {
        $admin = \App\Models\User::where('role', 'admin')->first();
        
        if (!$admin) {
            Log::warning('No admin user found to receive seller application notification');
            return;
        }

        $notificationKey = "admin-seller-app:{$event->applicationId}";
        
        $existing = Notification::where('key', $notificationKey)->first();
        
        if ($existing) {
            return;
        }

        Notification::create([
            'user_id' => $admin->id,
            'type' => 'product',
            'key' => $notificationKey,
            'title' => "Pengajuan Seller {$event->storeName} menunggu",
            'description' => "{$event->applicantName} mengajukan untuk menjadi seller.",
            'href' => route('admin.seller-applications.index', ['filter_pending' => 1], false),
            'data' => [
                'application_id' => $event->applicationId,
                'store_name' => $event->storeName,
                'source' => 'seller_application',
            ],
            'created_at' => now(),
        ]);
    }
}
