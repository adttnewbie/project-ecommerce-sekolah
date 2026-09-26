<?php

use App\Enums\OrderItemStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProductSalesMethod;
use App\Enums\UpJurusanConsignmentStatus;
use App\Enums\UserRole;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\UpJurusan;
use App\Models\UpJurusanConsignment;
use App\Models\User;
use App\Support\OrderLivenessService;

test('checkout consumes only the chosen UP stock and never borrows another UP', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $upA = UpJurusan::factory()->create();
    $upB = UpJurusan::factory()->create();
    $product = Product::factory()
        ->for($seller, 'seller')
        ->approved()
        ->create([
            'price' => 3000,
            'stock' => 0,
            'sales_method' => ProductSalesMethod::UpJurusan,
        ]);
    $consignmentA = UpJurusanConsignment::factory()->create([
        'seller_id' => $seller->id,
        'product_id' => $product->id,
        'up_jurusan_id' => $upA->id,
        'received_quantity' => 5,
        'sold_quantity' => 0,
        'commission_rate' => 10,
        'status' => UpJurusanConsignmentStatus::Received,
    ]);
    $consignmentB = UpJurusanConsignment::factory()->create([
        'seller_id' => $seller->id,
        'product_id' => $product->id,
        'up_jurusan_id' => $upB->id,
        'received_quantity' => 5,
        'sold_quantity' => 0,
        'commission_rate' => 10,
        'status' => UpJurusanConsignmentStatus::Received,
    ]);
    CartItem::query()->create([
        'user_id' => $buyer->id,
        'product_id' => $product->id,
        'quantity' => 2,
    ]);

    $this->actingAs($buyer)
        ->post(route('checkout'), [
            'pickup_method' => 'pickup',
            'pickup_up_jurusan_id' => $upA->id,
        ])
        ->assertSessionHasNoErrors();

    // Only UP-A consumed; UP-B untouched (multi-UP isolation).
    expect($consignmentA->fresh()->sold_quantity)->toBe(2)
        ->and($consignmentB->fresh()->sold_quantity)->toBe(0);
});

test('checkout fails when the chosen UP stock is empty even if another UP has stock', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $upA = UpJurusan::factory()->create();
    $upB = UpJurusan::factory()->create();
    $product = Product::factory()
        ->for($seller, 'seller')
        ->approved()
        ->create([
            'price' => 3000,
            'stock' => 0,
            'sales_method' => ProductSalesMethod::UpJurusan,
        ]);
    $consignmentA = UpJurusanConsignment::factory()->create([
        'seller_id' => $seller->id,
        'product_id' => $product->id,
        'up_jurusan_id' => $upA->id,
        'received_quantity' => 2,
        'sold_quantity' => 2,
        'commission_rate' => 10,
        'status' => UpJurusanConsignmentStatus::Completed,
    ]);
    $consignmentB = UpJurusanConsignment::factory()->create([
        'seller_id' => $seller->id,
        'product_id' => $product->id,
        'up_jurusan_id' => $upB->id,
        'received_quantity' => 5,
        'sold_quantity' => 0,
        'commission_rate' => 10,
        'status' => UpJurusanConsignmentStatus::Received,
    ]);
    CartItem::query()->create([
        'user_id' => $buyer->id,
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    $this->actingAs($buyer)
        ->from(route('cart.index'))
        ->post(route('checkout'), [
            'pickup_method' => 'pickup',
            'pickup_up_jurusan_id' => $upA->id,
        ])
        ->assertSessionHasErrors('cart');

    // Strict isolation: must not silently borrow UP-B stock.
    expect($consignmentA->fresh()->sold_quantity)->toBe(2)
        ->and($consignmentB->fresh()->sold_quantity)->toBe(0)
        ->and(Order::query()->where('user_id', $buyer->id)->count())->toBe(0);
});

test('checkout allows self-purchase of own product without seller notification', function () {
    $seller = User::factory()->create(['role' => UserRole::Buyer]);
    // Buyer who is also a seller: product owned by the same user.
    $product = Product::factory()
        ->approved()
        ->create([
            'seller_id' => $seller->id,
            'price' => 5000,
            'stock' => 5,
        ]);
    CartItem::query()->create([
        'user_id' => $seller->id,
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    $this->actingAs($seller)
        ->from(route('cart.index'))
        ->post(route('checkout'), ['pickup_method' => 'pickup'])
        ->assertSessionHasNoErrors();

    $order = Order::query()->where('user_id', $seller->id)->sole();
    expect($order->items()->count())->toBe(1)
        ->and(\App\Models\Notification::query()->where('key', 'like', "order-pending:{$order->id}:%")->count())->toBe(0);
});

test('checkout enforces buy now quantity max 1000', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->approved()->create(['price' => 1000, 'stock' => 5000]);

    $this->actingAs($buyer)
        ->from(route('checkout.confirm'))
        ->post(route('checkout'), [
            'pickup_method' => 'pickup',
            'buy_now_product_id' => $product->id,
            'buy_now_quantity' => 1001,
        ])
        ->assertSessionHasErrors('buy_now_quantity');

    expect(Order::query()->where('user_id', $buyer->id)->count())->toBe(0);
});

test('checkout enforces selected cart item ids max 50', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->approved()->create(['price' => 1000, 'stock' => 5000]);
    CartItem::query()->create([
        'user_id' => $buyer->id,
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    $this->actingAs($buyer)
        ->from(route('cart.index'))
        ->post(route('checkout'), [
            'pickup_method' => 'pickup',
            'selected_cart_item_ids' => range(1, 51),
        ])
        ->assertSessionHasErrors('selected_cart_item_ids');

    expect(Order::query()->where('user_id', $buyer->id)->count())->toBe(0);
});

test('admin forceComplete completes sent paid items with locked rows', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $order = Order::factory()->for($buyer, 'user')->create();
    $item = OrderItem::factory()->create([
        'order_id' => $order->id,
        'status' => OrderItemStatus::Sent,
        'payment_status' => PaymentStatus::Paid,
    ]);

    OrderLivenessService::forceComplete($order, $admin, 'Uji paksa selesai');

    expect($item->fresh()->status)->toBe(OrderItemStatus::Completed)
        ->and($order->fresh()->requires_manual_review)->toBeFalse();
});
