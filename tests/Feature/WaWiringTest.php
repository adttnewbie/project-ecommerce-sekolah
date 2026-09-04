<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Events\PendingOrderCreated;
use App\Models\Order;
use App\Models\User;
use App\Models\WaNotificationLog;
use Illuminate\Support\Facades\Queue;

test('checkout event enqueues order.baru wa log for seller', function () {
    Queue::fake();
    $seller = User::factory()->create(['role' => UserRole::Seller, 'phone' => '08123456780']);
    $buyer = User::factory()->create(['role' => UserRole::Buyer, 'phone' => '08123456789']);
    $order = Order::factory()->create(['user_id' => $buyer->id]);
    PendingOrderCreated::dispatch($order->id, $order->code, 0, 'Produk', $seller->id, $buyer->name, 10000);
    $this->assertDatabaseHas('wa_notification_logs', ['template_key' => 'order.baru', 'status' => 'pending', 'to' => '628123456780']);
});

test('reminder command queues order.reminder only for users with phone', function () {
    Queue::fake();
    $withPhone = User::factory()->create(['phone' => '08123456789']);
    $withoutPhone = User::factory()->create(['phone' => null]);
    Order::factory()->create(['user_id' => $withPhone->id, 'status' => OrderStatus::Open, 'payment_status' => PaymentStatus::Unpaid, 'created_at' => now()->subHours(5)]);
    Order::factory()->create(['user_id' => $withoutPhone->id, 'status' => OrderStatus::Open, 'payment_status' => PaymentStatus::Unpaid, 'created_at' => now()->subHours(5)]);
    $this->artisan('wa:reminders')->assertSuccessful();
    $this->assertDatabaseHas('wa_notification_logs', ['template_key' => 'order.reminder', 'to' => '628123456789']);
    expect(WaNotificationLog::where('template_key', 'order.reminder')->count())->toBe(1);
});
