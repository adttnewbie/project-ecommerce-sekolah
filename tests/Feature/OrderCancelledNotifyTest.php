<?php

use App\Enums\OrderItemStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProductFulfillmentType;
use App\Enums\ProductStatus;
use App\Enums\UserRole;
use App\Events\OrderItemCancelled;
use App\Models\Notification;
use App\Models\NotificationPreference;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Support\OrderItemCancellation;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function sellerWithCancellableItem(): array
{
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $product = Product::factory()->for($seller, 'seller')->create([
        'status' => ProductStatus::Approved,
        'fulfillment_type' => ProductFulfillmentType::ReadyStock,
    ]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $order = Order::factory()->for($buyer)->create();
    $item = OrderItem::factory()->for($order)->for($product)->create([
        'status' => OrderItemStatus::Pending,
        'payment_status' => PaymentStatus::Unpaid,
    ]);

    return [$seller, $buyer, $order, $item];
}

it('notifies every affected seller when the buyer cancels their order', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $order = Order::factory()->for($buyer)->create();

    foreach ([1, 2] as $i) {
        $seller = User::factory()->create(['role' => UserRole::Seller]);
        $product = Product::factory()->for($seller, 'seller')->approved()->create();
        OrderItem::factory()->for($order)->for($product)->create([
            'status' => OrderItemStatus::Pending,
            'payment_status' => PaymentStatus::Unpaid,
        ]);
    }

    OrderItemCancellation::cancelOrder($order, $buyer, 'Berubah pikiran');

    $rows = Notification::query()->where('key', 'like', 'seller-item-cancelled:%')->get();

    expect($rows)->toHaveCount(2)
        ->and($rows->every(fn ($n) => str_contains($n->description, 'Pembeli')))->toBeTrue()
        ->and(Notification::query()->where('user_id', $buyer->id)->where('key', 'like', 'buyer-order-item:%')->exists())->toBeFalse();
});

it('keeps two-way silence rules: seller self-cancel skips self but informs buyer', function () {
    [$seller, $buyer, , $item] = sellerWithCancellableItem();

    OrderItemCancellation::cancelItem($item, $seller, 'Stok hilang');

    expect(Notification::query()
        ->where('key', "seller-item-cancelled:{$item->id}")
        ->exists())->toBeFalse()
        ->and(Notification::query()
            ->where('key', "buyer-order-item:{$item->id}:cancelled")
            ->where('user_id', $buyer->id)
            ->exists())->toBeTrue();
});

it('informs both sides when a picket cancels an item', function () {
    [$seller, $buyer, $order, $item] = sellerWithCancellableItem();
    $picket = User::factory()->create([
        'role' => UserRole::PicketOfficer,
    ]);

    // Listener-level check: the picket cancellation route funnels into this
    // event through the shared cancellation choke point.
    OrderItemCancelled::dispatch(
        orderItemId: $item->id,
        orderId: $order->id,
        productName: $item->product_name,
        sellerId: $seller->id,
        buyerId: $buyer->id,
        actorId: $picket->id,
        actorRole: UserRole::PicketOfficer->value,
        reason: 'Barang rusak diperiksa',
    );

    expect(Notification::query()
        ->where('key', "seller-item-cancelled:{$item->id}")
        ->where('user_id', $seller->id)
        ->where('description', 'like', '%Petugas picket%')
        ->exists())->toBeTrue()
        ->and(Notification::query()
            ->where('key', "buyer-order-item:{$item->id}:cancelled")
            ->where('user_id', $buyer->id)
            ->exists())->toBeTrue();
});

it('reaches the seller even for system-side expiry cancellations', function () {
    [$seller, , , $item] = sellerWithCancellableItem();
    $systemActor = User::factory()->create(['role' => UserRole::Admin]);

    OrderItemCancellation::cancelItem(
        $item,
        $systemActor,
        'Otomatis dibatalkan karena melewati batas waktu pembayaran',
        true,
    );

    expect(Notification::query()
        ->where('key', "seller-item-cancelled:{$item->id}")
        ->where('user_id', $seller->id)
        ->where('description', 'like', '%Sistem%')
        ->exists())->toBeTrue();
});

it('respects the seller in-app preference gate', function () {
    [$seller, $buyer, , $item] = sellerWithCancellableItem();

    NotificationPreference::create([
        'user_id' => $seller->id,
        'type' => 'order',
        'in_app_enabled' => false,
        'email_enabled' => false,
    ]);

    OrderItemCancellation::cancelItem($item, $buyer, 'Berubah pikiran');

    expect(Notification::query()
        ->where('key', "seller-item-cancelled:{$item->id}")
        ->exists())->toBeFalse();
});
