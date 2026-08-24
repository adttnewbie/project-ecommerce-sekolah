<?php

namespace Database\Seeders;

use App\Models\Notification;
use Illuminate\Database\Seeder;

class TestNotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all users with roles
        $users = \App\Models\User::whereNotNull('role')->get();
        
        if ($users->isEmpty()) {
            $this->command->warn("No users found with roles. Creating sample user first...");
            // Create a sample admin user if none exist
            \App\Models\User::create([
                'name' => 'Test Admin',
                'email' => 'admin@test.com',
                'password' => bcrypt('password'),
                'role' => 'admin',
            ]);
            
            $users = \App\Models\User::whereNotNull('role')->get();
        }
        
        foreach ($users as $user) {
            $userId = $user->id;
            $userRole = $user->role?->value ?? 'buyer';
            
            // Create test notifications based on role
            if (in_array($userRole, ['seller', 'admin_jurusan'])) {
                // Seller: order notification
                Notification::create([
                    'user_id' => $userId,
                    'type' => 'order',
                    'key' => 'test-order-' . uniqid(),
                    'title' => 'Pesanan #ORD001',
                    'description' => 'Buku Pelajaran Matematika menunggu diproses',
                    'href' => '/seller/orders/1',
                ]);
                
                // Seller: stock notification  
                Notification::create([
                    'user_id' => $userId,
                    'type' => 'stock',
                    'key' => 'test-stock-' . uniqid(),
                    'title' => 'Stok Menipis',
                    'description' => 'Alat Tulis Pena Bolpoint tersisa 5',
                    'href' => '/seller/inventory?q=Pena',
                ]);
            }
            
            if ($userRole === 'admin') {
                // Admin: product moderation notification
                Notification::create([
                    'user_id' => $userId,
                    'type' => 'product',
                    'key' => 'test-product-' . uniqid(),
                    'title' => 'Moderasi Produk',
                    'description' => 'Menunggu moderasi dari PT Sekolah Maju Jaya',
                    'href' => '/admin/products/moderation',
                ]);
            }
            
            // For all users: system notification
            Notification::create([
                'user_id' => $userId,
                'type' => 'system',
                'key' => 'test-system-' . uniqid(),
                'title' => 'Maintenance Sistem',
                'description' => 'Sistem akan maintenance besok malam pukul 02:00',
                'href' => '/dashboard',
            ]);
            
            $this->command->info("Created test notifications for user {$userId} ({$userRole})");
        }
        
        $this->command->info("\n✓ Test notifications created successfully!");
        $this->command->info("Total notifications in DB: " . Notification::count());
    }
}
