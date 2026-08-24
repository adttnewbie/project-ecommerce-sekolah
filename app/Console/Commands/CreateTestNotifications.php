<?php

namespace App\Console\Commands;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Console\Command;

class CreateTestNotifications extends Command
{
    protected $signature = 'notifications:create-test';
    protected $description = 'Create test notifications for admin and seller roles';

    public function handle(): int
    {
        $admin = User::where('role', 'admin')->first();
        
        if (!$admin) {
            $this->error('No admin user found. Please create an admin user first.');
            return self::FAILURE;
        }

        // Admin notifications
        Notification::create([
            'user_id' => $admin->id,
            'type' => 'product',
            'key' => 'test-admin-product-1',
            'title' => 'Produk "Sepatu Olahraga" menunggu persetujuan',
            'description' => 'Seller baru mengajukan produk untuk ditinjau.',
            'href' => route('admin.products.moderation.index'),
            'created_at' => now(),
        ]);

        Notification::create([
            'user_id' => $admin->id,
            'type' => 'order',
            'key' => 'test-admin-order-1',
            'title' => 'Pesanan baru dari Budi Santoso',
            'description' => 'Total: Rp 500.000 - Menunggu verifikasi',
            'href' => route('admin.orders.index'),
            'created_at' => now()->subHour(),
        ]);

        Notification::create([
            'user_id' => $admin->id,
            'type' => 'system',
            'key' => 'test-admin-system-1',
            'title' => 'Pengajuan Seller Toko Berkah',
            'description' => 'Permohonan menjadi seller baru menunggu peninjauan.',
            'href' => route('admin.seller-applications.index'),
            'created_at' => now()->subDays(2),
        ]);

        $this->info("✅ Created {$admin->name} test notifications!");
        
        // Show created count
        $count = Notification::where('user_id', $admin->id)->count();
        $this->info("   Total notifications for {$admin->name}: {$count}");

        return self::SUCCESS;
    }
}
