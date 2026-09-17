<?php

use App\Enums\OrderItemStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProductSalesMethod;
use App\Enums\StockMovementSource;
use App\Enums\UpJurusanConsignmentStatus;
use App\Enums\UserRole;
use App\Models\NotificationPreference;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\UpJurusan;
use App\Models\UpJurusanConsignment;
use App\Models\UpJurusanStockMovement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/**
 * Logic-only coverage for the notification gaps closed in items b.1-b.4/c.2:
 * every assertion is a POST/PUT action plus assertDatabaseHas on the
 * notifications table. No GET page is ever rendered (the environment has no
 * Vite manifest, so page renders 500 here).
 *
 * Helper names carry the gapFix prefix: roleUser/consignmentProduct (in
 * NotificationTriggerMatrixTest) and picketForUpJurusan/seedUpManagedCart (in
 * PicketVerificationNotifyTest) already occupy the global function namespace.
 *
 * @return array{0: User, 1: User, 2: OrderItem}
 */
function gapFixConsignmentRejectFixture(): array
{
    $upJurusan = UpJurusan::factory()->create();
    $picket = User::factory()->create([
        'role' => UserRole::PicketOfficer,
        'up_jurusan_id' => $upJurusan->id,
    ]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->for($seller, 'seller')->create([
        'sales_method' => ProductSalesMethod::UpJurusan,
        'stock' => 0,
    ]);
    $consignment = UpJurusanConsignment::factory()->create([
        'seller_id' => $seller->id,
        'product_id' => $product->id,
        'up_jurusan_id' => $upJurusan->id,
        'status' => UpJurusanConsignmentStatus::Received,
        'requested_quantity' => 10,
        'received_quantity' => 10,
        'sold_quantity' => 2,
        'commission_rate' => 10,
    ]);

    $order = Order::factory()->create([
        'user_id' => $buyer->id,
        'payment_status' => PaymentStatus::Unpaid,
    ]);
    $orderItem = OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'quantity' => 2,
        'status' => OrderItemStatus::Pending,
        'payment_status' => PaymentStatus::Unpaid,
        'price' => 1000,
        'subtotal' => 2000,
    ]);

    UpJurusanStockMovement::query()->create([
        'up_jurusan_consignment_id' => $consignment->id,
        'product_id' => null,
        'order_id' => $order->id,
        'user_id' => $picket->id,
        'type' => 'out',
        'source' => StockMovementSource::OnlineOrder,
        'quantity' => 2,
        'unit_price' => 1000,
        'gross_amount' => 2000,
        'commission_amount' => 200,
        'seller_amount' => 1800,
        'note' => 'Checkout online',
    ]);

    return [$picket, $seller, $orderItem];
}

test('picket reject pembayaran konsinyasi memberi tahu seller', function () {
    [$picket, $seller, $orderItem] = gapFixConsignmentRejectFixture();

    $this->actingAs($picket)
        ->from(route('picket.orders'))
        ->post(route('picket.orders.payment.reject', $orderItem), [
            'payment_rejection_reason' => 'Uang tunai tidak diterima.',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('notifications', [
        'user_id' => $seller->id,
        'key' => "seller-payment-rejected:{$orderItem->id}",
    ]);
});

test('admin force complete memberi tahu seller item', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $product = Product::factory()->for($seller, 'seller')->approved()->create();
    $order = Order::factory()->for($buyer)->create([
        'status' => OrderStatus::Open,
        'payment_status' => PaymentStatus::Paid,
    ]);
    $item = OrderItem::factory()->for($order)->for($product)->create([
        'status' => OrderItemStatus::Sent,
        'payment_status' => PaymentStatus::Paid,
    ]);

    $this->actingAs($admin)
        ->post(route('admin.orders.force-complete', $order), [
            'reason' => 'Pembeli tidak kunjung konfirmasi.',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('notifications', [
        'user_id' => $seller->id,
        'key' => "seller-force-completed:{$item->id}",
    ]);
});

test('mark review memberi tahu seller dan buyer', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $product = Product::factory()->for($seller, 'seller')->approved()->create();
    $order = Order::factory()->for($buyer)->create([
        'status' => OrderStatus::Open,
    ]);
    $item = OrderItem::factory()->for($order)->for($product)->create();

    $this->actingAs($admin)
        ->post(route('admin.orders.mark-review', $order), [
            'reason' => 'Perlu dicek manual.',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('notifications', [
        'user_id' => $seller->id,
        'key' => "seller-manual-review:{$item->id}",
    ]);
    $this->assertDatabaseHas('notifications', [
        'user_id' => $buyer->id,
        'key' => "buyer-manual-review:{$order->id}",
    ]);
});

test('preferensi notifikasi tersimpan tanpa render halaman', function () {
    $user = User::factory()->create(['role' => UserRole::Buyer]);

    $this->actingAs($user)
        ->put(route('notifications.preferences.update'), [
            'preferences' => [
                'order' => ['in_app_enabled' => false],
                'payment' => ['in_app_enabled' => true],
            ],
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('notification_preferences', [
        'user_id' => $user->id,
        'type' => 'order',
    ]);

    expect(NotificationPreference::query()->where('user_id', $user->id)->where('type', 'order')->sole()->in_app_enabled)->toBeFalse()
        ->and(NotificationPreference::query()->where('user_id', $user->id)->where('type', 'payment')->sole()->in_app_enabled)->toBeTrue();
});
