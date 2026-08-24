<?php

use App\Enums\OrderItemStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProductStatus;
use App\Enums\UserRole;
use App\Events\OrderItemStatusChanged;
use App\Events\OrderPaymentApproved;
use App\Models\Notification;
use App\Models\NotificationPreference;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Support\OrderLivenessService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function buyerWithSentItem(): array
{
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->for(
        User::factory()->create(['role' => UserRole::Seller]),
        'seller',
    )->create(['status' => ProductStatus::Approved]);
    $order = Order::factory()->for($buyer)->create();
    $item = OrderItem::factory()->for($order)->for($product)->create([
        'status' => OrderItemStatus::Packed,
        'payment_status' => PaymentStatus::Unpaid,
    ]);

    return [$buyer, $order, $item];
}

function dispatchItemStatus(OrderItem $item, string $statusValue): void
{
    OrderItemStatusChanged::dispatch(
        orderItemId: $item->id,
        orderId: $item->order_id,
        productId: $item->product_id,
        consignmentId: null,
        productName: $item->product_name,
        sellerName: 'Toko Uji',
        buyerName: 'Buyer Uji',
        action: "status diubah ke {$statusValue}",
        picketId: null,
        consignmentStatus: null,
        itemStatus: $statusValue,
    );
}

it('notifies the buyer when their item is packed or sent', function () {
    [$buyer, $order, $item] = buyerWithSentItem();

    dispatchItemStatus($item, 'sent');

    $notification = Notification::query()
        ->where('key', "buyer-order-item:{$item->id}:sent")
        ->where('user_id', $buyer->id)
        ->sole();

    expect($notification->href)->toBe(route('orders.show', $order, absolute: false))
        ->and($notification->type)->toBe('order');

    // Role-accessible href.
    $this->actingAs($buyer)->get($notification->href)->assertOk();
});

it('ignores consignment-style dispatches that carry no item status', function () {
    [, , $item] = buyerWithSentItem();

    OrderItemStatusChanged::dispatch(
        orderItemId: $item->id,
        orderId: $item->order_id,
        productId: $item->product_id,
        consignmentId: null,
        productName: $item->product_name,
        sellerName: 'Toko',
        buyerName: 'Buyer',
        action: 'status diubah ke Dikirim',
        picketId: null,
        consignmentStatus: null,
        itemStatus: null,
    );

    expect(Notification::query()->where('key', 'like', 'buyer-order-item:%')->exists())->toBeFalse();
});

it('tells the buyer when a picket confirms or rejects their cash payment', function () {
    [$buyer, $order, $item] = buyerWithSentItem();

    OrderPaymentApproved::dispatch(
        orderItemId: $item->id,
        orderNumber: 'TRX-77',
        amount: $item->subtotal,
        status: 'rejected',
        processedBy: null,
        rejectionReason: 'Nominal kurang',
    );

    $rejected = Notification::query()
        ->where('key', "buyer-payment:{$item->id}:rejected")
        ->where('user_id', $buyer->id)
        ->sole();

    expect($rejected->description)->toContain('Nominal kurang')
        ->and($rejected->type)->toBe('payment');

    OrderPaymentApproved::dispatch(
        orderItemId: $item->id,
        orderNumber: 'TRX-77',
        amount: $item->subtotal,
        status: 'approved',
        processedBy: null,
    );

    expect(Notification::query()->where('key', "buyer-payment:{$item->id}:approved")->where('user_id', $buyer->id)->exists())->toBeTrue();
});

it('notifies the buyer when unpaid orders expire automatically', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    [$buyer, $order, $item] = buyerWithSentItem();

    $order->update([
        'status' => OrderStatus::Open,
        'payment_status' => PaymentStatus::Unpaid,
        'expires_at' => now()->subHour(),
    ]);
    $item->update([
        'status' => OrderItemStatus::Pending,
        'payment_status' => PaymentStatus::Unpaid,
    ]);

    OrderLivenessService::expireUnpaidOrders($admin);

    expect(Notification::query()
        ->where('key', "buyer-order-state:{$order->id}:cancelled_auto")
        ->where('user_id', $buyer->id)
        ->exists())->toBeTrue();
});

it('tells the buyer the reason behind an admin forced cancellation', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    [$buyer, $order] = buyerWithSentItem();

    $this->actingAs($admin)
        ->post(route('admin.orders.cancel', $order), [
            'cancel_reason' => 'Stok rusak sebelum dikirim',
        ])
        ->assertRedirect();

    $notification = Notification::query()
        ->where('key', "buyer-order-state:{$order->id}:cancelled_admin")
        ->where('user_id', $buyer->id)
        ->sole();

    expect($notification->description)->toContain('Stok rusak sebelum dikirim');
});

it('respects the buyer in-app preference while keeping other types alive', function () {
    [$buyer, , $item] = buyerWithSentItem();

    NotificationPreference::create([
        'user_id' => $buyer->id,
        'type' => 'order',
        'in_app_enabled' => false,
        'email_enabled' => false,
    ]);

    dispatchItemStatus($item, 'packed');

    expect(Notification::query()->where('key', "buyer-order-item:{$item->id}:packed")->exists())->toBeFalse();

    // Payment decisions use another type and still arrive.
    OrderPaymentApproved::dispatch(
        orderItemId: $item->id,
        orderNumber: 'TRX-88',
        amount: 10000,
        status: 'approved',
        processedBy: null,
    );

    expect(Notification::query()->where('key', "buyer-payment:{$item->id}:approved")->where('user_id', $buyer->id)->exists())->toBeTrue();
});
