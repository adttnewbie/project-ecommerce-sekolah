<?php

use App\Enums\OrderItemStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Support\OrderLivenessService;
use Illuminate\Support\Facades\Artisan;
use Inertia\Testing\AssertableInertia as Assert;

test('unpaid expired orders are detected', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->approved()->create();
    $order = Order::factory()->for($buyer)->create([
        'status' => OrderStatus::Open,
        'payment_status' => PaymentStatus::Unpaid,
        'expires_at' => now()->subHour(),
    ]);
    OrderItem::factory()->for($order)->for($product)->create([
        'status' => OrderItemStatus::Pending,
        'payment_status' => PaymentStatus::Unpaid,
    ]);

    expect(OrderLivenessService::unpaidExpiredQuery()->whereKey($order->id)->exists())->toBeTrue()
        ->and(OrderLivenessService::livenessLabel($order))->toBe('expired');
});

test('paid packed item idle beyond sla is stuck', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->approved()->create();
    $order = Order::factory()->for($buyer)->create([
        'status' => OrderStatus::Open,
        'payment_status' => PaymentStatus::Paid,
    ]);
    OrderItem::factory()->for($order)->for($product)->create([
        'status' => OrderItemStatus::Packed,
        'payment_status' => PaymentStatus::Paid,
        'payment_confirmed_at' => now()->subHours(OrderLivenessService::FULFILLMENT_IDLE_HOURS + 2),
        'status_changed_at' => now()->subHours(OrderLivenessService::FULFILLMENT_IDLE_HOURS + 2),
    ]);

    expect(OrderLivenessService::stuckFulfillmentQuery()->whereKey($order->id)->exists())->toBeTrue()
        ->and(OrderLivenessService::livenessLabel($order->fresh(['items'])))->toBe('stuck');
});

test('sent item idle beyond sla is stuck', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->approved()->create();
    $order = Order::factory()->for($buyer)->create([
        'status' => OrderStatus::Open,
        'payment_status' => PaymentStatus::Paid,
    ]);
    OrderItem::factory()->for($order)->for($product)->create([
        'status' => OrderItemStatus::Sent,
        'payment_status' => PaymentStatus::Paid,
        'status_changed_at' => now()->subHours(OrderLivenessService::SENT_IDLE_HOURS + 1),
    ]);

    expect(OrderLivenessService::stuckSentQuery()->whereKey($order->id)->exists())->toBeTrue()
        ->and(OrderLivenessService::livenessLabel($order->fresh(['items'])))->toBe('stuck');
});

test('fresh active paid order is not stuck', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->approved()->create();
    $order = Order::factory()->for($buyer)->create([
        'status' => OrderStatus::Open,
        'payment_status' => PaymentStatus::Paid,
        'expires_at' => now()->addDay(),
    ]);
    OrderItem::factory()->for($order)->for($product)->create([
        'status' => OrderItemStatus::Packed,
        'payment_status' => PaymentStatus::Paid,
        'payment_confirmed_at' => now()->subHour(),
        'status_changed_at' => now()->subHour(),
    ]);

    expect(OrderLivenessService::stuckQuery()->whereKey($order->id)->exists())->toBeFalse()
        ->and(OrderLivenessService::unpaidExpiredQuery()->whereKey($order->id)->exists())->toBeFalse()
        ->and(OrderLivenessService::livenessLabel($order->fresh(['items'])))->toBe('active');
});

test('detect stuck command marks stuck reasons', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->approved()->create();
    $order = Order::factory()->for($buyer)->create([
        'status' => OrderStatus::Open,
        'payment_status' => PaymentStatus::Paid,
    ]);
    OrderItem::factory()->for($order)->for($product)->create([
        'status' => OrderItemStatus::Pending,
        'payment_status' => PaymentStatus::Paid,
        'payment_confirmed_at' => now()->subHours(OrderLivenessService::FULFILLMENT_IDLE_HOURS + 5),
        'status_changed_at' => now()->subHours(OrderLivenessService::FULFILLMENT_IDLE_HOURS + 5),
    ]);

    Artisan::call('orders:detect-stuck');

    $order->refresh();
    expect($order->stuck_detected_at)->not->toBeNull()
        ->and($order->stuck_reasons)->toContain('fulfillment_idle');
});

test('admin cannot force cancel a paid order', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $product = Product::factory()->for($seller, 'seller')->approved()->create(['stock' => 0]);
    $order = Order::factory()->for($buyer)->create([
        'status' => OrderStatus::Open,
        'payment_status' => PaymentStatus::Paid,
    ]);
    OrderItem::factory()->for($order)->for($product)->create([
        'quantity' => 2,
        'status' => OrderItemStatus::Packed,
        'payment_status' => PaymentStatus::Paid,
        'status_changed_at' => now()->subDays(5),
    ]);

    $this->actingAs($admin)
        ->from(route('admin.orders.index'))
        ->post(route('admin.orders.cancel', $order), [
            'cancel_reason' => 'Force cancel stuck',
        ])
        ->assertSessionHasErrors('order');

    expect($order->fresh()->status)->toBe(OrderStatus::Open)
        ->and($order->items()->first()->status)->toBe(OrderItemStatus::Packed)
        ->and($product->fresh()->stock)->toBe(0);
});

test('admin can force complete sent paid order', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->approved()->create();
    $order = Order::factory()->for($buyer)->create([
        'status' => OrderStatus::Open,
        'payment_status' => PaymentStatus::Paid,
    ]);
    OrderItem::factory()->for($order)->for($product)->create([
        'status' => OrderItemStatus::Sent,
        'payment_status' => PaymentStatus::Paid,
        'status_changed_at' => now()->subDays(5),
    ]);

    $this->actingAs($admin)
        ->post(route('admin.orders.force-complete', $order))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($order->fresh()->status)->toBe(OrderStatus::Completed)
        ->and($order->items()->first()->status)->toBe(OrderItemStatus::Completed);
});

test('admin can mark order for manual review', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $order = Order::factory()->for($buyer)->create();

    $this->actingAs($admin)
        ->post(route('admin.orders.mark-review', $order), [
            'reason' => 'Buyer komplain',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $order->refresh();
    expect($order->requires_manual_review)->toBeTrue()
        ->and($order->requires_manual_review_reason)->toBe('Buyer komplain')
        ->and(OrderLivenessService::livenessLabel($order))->toBe('requires_action');
});

test('admin cannot mark a completed order for manual review', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $order = Order::factory()->for($buyer)->create([
        'status' => OrderStatus::Completed,
        'payment_status' => PaymentStatus::Paid,
    ]);

    $this->actingAs($admin)
        ->from(route('admin.orders.index'))
        ->post(route('admin.orders.mark-review', $order), [
            'reason' => 'Komplain',
        ])
        ->assertSessionHasErrors('order');

    expect($order->fresh()->requires_manual_review)->toBeFalse();
});

test('admin cannot mark a cancelled order for manual review', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $order = Order::factory()->for($buyer)->create([
        'status' => OrderStatus::Cancelled,
        'payment_status' => PaymentStatus::Unpaid,
    ]);

    $this->actingAs($admin)
        ->from(route('admin.orders.index'))
        ->post(route('admin.orders.mark-review', $order), [
            'reason' => 'Komplain',
        ])
        ->assertSessionHasErrors('order');

    expect($order->fresh()->requires_manual_review)->toBeFalse();
});

test('admin orders index filters by liveness', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->approved()->create();

    $expired = Order::factory()->for($buyer)->create([
        'status' => OrderStatus::Open,
        'payment_status' => PaymentStatus::Unpaid,
        'expires_at' => now()->subHour(),
    ]);
    OrderItem::factory()->for($expired)->for($product)->create([
        'status' => OrderItemStatus::Pending,
        'payment_status' => PaymentStatus::Unpaid,
    ]);

    $active = Order::factory()->for($buyer)->create([
        'status' => OrderStatus::Open,
        'payment_status' => PaymentStatus::Paid,
        'expires_at' => now()->addDay(),
    ]);
    OrderItem::factory()->for($active)->for($product)->create([
        'status' => OrderItemStatus::Pending,
        'payment_status' => PaymentStatus::Paid,
        'status_changed_at' => now(),
        'payment_confirmed_at' => now(),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.orders.index', ['liveness' => 'expired']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/orders/index')
            ->has('orders.data', 1)
            ->where('orders.data.0.id', $expired->id)
            ->where('filters.liveness', 'expired'),
        );

    $this->actingAs($admin)
        ->get(route('admin.orders.index', ['liveness' => 'active']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('orders.data', 1)
            ->where('orders.data.0.id', $active->id),
        );
});

test('expire unpaid still works via liveness service', function () {
    User::factory()->create(['role' => UserRole::Admin]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $product = Product::factory()->for($seller, 'seller')->approved()->create(['stock' => 1]);
    $order = Order::factory()->for($buyer)->create([
        'expires_at' => now()->subHour(),
        'payment_status' => PaymentStatus::Unpaid,
    ]);
    OrderItem::factory()->for($order)->for($product)->create([
        'quantity' => 1,
        'status' => OrderItemStatus::Pending,
        'payment_status' => PaymentStatus::Unpaid,
    ]);

    Artisan::call('orders:expire-unpaid');

    expect($order->fresh()->status)->toBe(OrderStatus::Cancelled)
        ->and($product->fresh()->stock)->toBe(2);
});

test('expiry batch skips an item paid mid-run and still cancels the rest', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $productA = Product::factory()->approved()->create(['stock' => 4]);
    $productB = Product::factory()->approved()->create(['stock' => 6]);

    $orderA = Order::factory()->for($buyer)->create([
        'expires_at' => now()->subHour(),
        'payment_status' => PaymentStatus::Unpaid,
    ]);
    $itemA = OrderItem::factory()->for($orderA)->for($productA)->create([
        'quantity' => 1,
        'status' => OrderItemStatus::Pending,
        'payment_status' => PaymentStatus::Unpaid,
    ]);

    $orderB = Order::factory()->for($buyer)->create([
        'expires_at' => now()->subHour(),
        'payment_status' => PaymentStatus::Unpaid,
    ]);
    $itemB = OrderItem::factory()->for($orderB)->for($productB)->create([
        'quantity' => 1,
        'status' => OrderItemStatus::Pending,
        'payment_status' => PaymentStatus::Unpaid,
    ]);

    // Deterministic race simulation: whichever item the batch cancels first
    // flips the other one to Paid, mimicking a concurrent payment approval
    // landing between the pre-read and the locked re-read.
    $armed = true;
    OrderItem::updated(function (OrderItem $record) use (&$armed, $itemA, $itemB): void {
        if (! $armed) {
            return;
        }

        $target = match (true) {
            $record->is($itemA) => $itemB,
            $record->is($itemB) => $itemA,
            default => null,
        };

        if ($target === null) {
            return;
        }

        $armed = false;
        OrderItem::query()
            ->whereKey($target->getKey())
            ->update(['payment_status' => PaymentStatus::Paid->value]);
    });

    $cancelled = OrderLivenessService::expireUnpaidOrders($admin);

    $statuses = [
        $orderA->fresh()->status->value,
        $orderB->fresh()->status->value,
    ];
    sort($statuses);

    expect($cancelled)->toBe(1)
        ->and($statuses)->toBe([OrderStatus::Cancelled->value, OrderStatus::Open->value])
        ->and(
            $itemA->fresh()->payment_status === PaymentStatus::Paid ||
            $itemB->fresh()->payment_status === PaymentStatus::Paid
        )->toBeTrue();
});
