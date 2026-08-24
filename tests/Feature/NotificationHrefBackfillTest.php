<?php

use App\Enums\NotificationType;
use App\Enums\UserRole;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Support\NotificationHrefBackfill;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createPendingNotification(User $user, string $href, ?int $orderId = null): Notification
{
    return Notification::create([
        'user_id' => $user->id,
        'type' => NotificationType::Order->value,
        'key' => sprintf('order-pending:%d:%d', $orderId ?? fake()->numberBetween(1, 9999), $user->id),
        'title' => 'Pesanan baru',
        'description' => null,
        'href' => $href,
        'data' => ['source' => 'pending_order_created'],
    ]);
}

it('rewrites stale order-id hrefs to the seller own order-item page', function () {
    $seller = User::factory()->state(['role' => UserRole::Seller])->create();
    $otherSeller = User::factory()->state(['role' => UserRole::Seller])->create();
    $buyer = User::factory()->create();

    $product = Product::factory()->for($seller, 'seller')->create();
    $foreignProduct = Product::factory()->for($otherSeller, 'seller')->create();

    // Push order ids past item ids so "/seller/orders/{id}" cannot be
    // ambiguous between the two tables on a fresh database.
    Order::factory()->times(3)->for($buyer)->create();
    $order = Order::factory()->for($buyer)->create();

    $ownItem = OrderItem::factory()->for($order)->for($product)->create();
    OrderItem::factory()->for($order)->for($foreignProduct)->create();

    $notification = createPendingNotification($seller, "/seller/orders/{$order->id}");

    $fixed = NotificationHrefBackfill::run();

    expect($fixed)->toBe(1)
        ->and($notification->fresh()->href)->toBe("/seller/orders/{$ownItem->id}");
});

it('keeps hrefs that already point at the seller own order item', function () {
    $seller = User::factory()->state(['role' => UserRole::Seller])->create();
    $buyer = User::factory()->create();

    $product = Product::factory()->for($seller, 'seller')->create();
    $order = Order::factory()->for($buyer)->create();
    $item = OrderItem::factory()->for($order)->for($product)->create();

    $notification = createPendingNotification($seller, "/seller/orders/{$item->id}");

    $fixed = NotificationHrefBackfill::run();

    expect($fixed)->toBe(0)
        ->and($notification->fresh()->href)->toBe("/seller/orders/{$item->id}");
});

it('falls back to the orders index when the linked entity no longer resolves', function () {
    $seller = User::factory()->state(['role' => UserRole::Seller])->create();
    $buyer = User::factory()->create();

    $product = Product::factory()->for($seller, 'seller')->create();
    $order = Order::factory()->for($buyer)->create();
    OrderItem::factory()->for($order)->for($product)->create();

    $orphaned = createPendingNotification($seller, '/seller/orders/424242');

    $wrongOwner = User::factory()->state(['role' => UserRole::Seller])->create();
    $misrouted = createPendingNotification(
        $wrongOwner,
        "/seller/orders/{$order->id}",
    );

    $fixed = NotificationHrefBackfill::run();

    expect($fixed)->toBe(2)
        ->and($orphaned->fresh()->href)->toBe('/seller/orders');
});
