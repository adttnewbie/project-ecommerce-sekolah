<?php

namespace App\Listeners;

use App\Events\AdminNotificationTriggered;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class AdminNotificationNotify
{
    /**
     * Handle the event.
     */
    public function handle(AdminNotificationTriggered $event): void
    {
        $admin = User::where('role', 'admin')
            ->with('upJurusan:id,name')
            ->first();

        if (! $admin) {
            Log::warning('No admin user found to receive notification');

            return;
        }

        $notificationKey = "admin-notification:{$event->type}-{$event->adminId}";

        $existing = Notification::where('key', $notificationKey)->first();

        if ($existing) {
            return;
        }

        Notification::create([
            'user_id' => $admin->id,
            'type' => $event->type,
            'key' => $notificationKey,
            'title' => $event->title,
            'description' => $event->description,
            'href' => $event->href ?? route('dashboard', false),
            'data' => $event->data,
            'created_at' => now(),
        ]);
    }
}
