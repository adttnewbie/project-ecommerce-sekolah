<?php

use App\Enums\OrderItemStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;

test('expire unpaid command bootstraps a system actor when no admin exists', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $product = Product::factory()->for($seller, 'seller')->approved()->create(['stock' => 1]);
    $order = Order::factory()->for($buyer)->create([
        'expires_at' => now()->subHour(),
        'payment_status' => PaymentStatus::Unpaid,
    ]);
    OrderItem::factory()->for($order)->for($product)->create([
        'quantity' => 2,
        'status' => OrderItemStatus::Pending,
        'payment_status' => PaymentStatus::Unpaid,
    ]);

    $exitCode = $this->artisan('orders:expire-unpaid')->run();
    $this->assertSame(0, $exitCode);

    expect($order->fresh()->status)->toBe(OrderStatus::Cancelled)
        ->and($product->fresh()->stock)->toBe(3)
        ->and(User::query()->where('role', UserRole::Admin)->count())->toBe(1)
        ->and(User::query()->where('role', UserRole::Admin)->value('name'))->toBe('Sistem (Otomatis)');
});

test('expiresAt command prefers an existing admin over a bootstrapped actor', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $exitCode = $this->artisan('orders:expire-unpaid')->run();
    $this->assertSame(0, $exitCode);

    expect(User::query()->where('role', UserRole::Admin)->count())->toBe(1)
        ->and(User::query()->find($admin->id)->name)->not->toBe('Sistem (Otomatis)');
});
