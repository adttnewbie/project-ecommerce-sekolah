<?php

use App\Enums\OrderItemStatus;
use App\Enums\PaymentStatus;
use App\Enums\PreOrderStatus;
use App\Models\OrderItem;
use App\Models\Product;
use App\Support\OrderItemFulfillment;
use App\Support\PreOrderRules;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('deadline passed only after pre order deadline day', function () {
    $product = Product::factory()->approved()->preOrder()->create([
        'pre_order_deadline' => now()->toDateString(),
        'pre_order_min_quantity' => null,
    ]);

    expect(PreOrderRules::isDeadlinePassed($product))->toBeFalse();

    $product->update(['pre_order_deadline' => now()->subDay()->toDateString()]);

    expect(PreOrderRules::isDeadlinePassed($product->fresh()))->toBeTrue();
});

test('status is open without deadline', function () {
    $product = Product::factory()->approved()->preOrder()->create([
        'pre_order_deadline' => null,
    ]);

    expect(PreOrderRules::status($product))->toBe(PreOrderStatus::Open)
        ->and($product->preOrderStatus())->toBe(PreOrderStatus::Open);
});

test('status stays open while deadline is more than three days away', function () {
    $product = Product::factory()->approved()->preOrder()->create([
        'pre_order_deadline' => now()->addDays(4)->toDateString(),
    ]);

    expect(PreOrderRules::status($product))->toBe(PreOrderStatus::Open);
});

test('status becomes closing soon within three days of deadline', function () {
    $product = Product::factory()->approved()->preOrder()->create([
        'pre_order_deadline' => now()->addDays(3)->toDateString(),
    ]);

    expect(PreOrderRules::status($product))->toBe(PreOrderStatus::ClosingSoon);

    $product->update(['pre_order_deadline' => now()->toDateString()]);

    expect(PreOrderRules::status($product->fresh()))->toBe(PreOrderStatus::ClosingSoon);
});

test('status closes the day after deadline', function () {
    $product = Product::factory()->approved()->preOrder()->create([
        'pre_order_deadline' => now()->subDay()->toDateString(),
    ]);

    expect(PreOrderRules::status($product))->toBe(PreOrderStatus::Closed)
        ->and(PreOrderRules::isValid($product, 99))->toBeFalse();
});

test('non pre order products have no pre order status', function () {
    $product = Product::factory()->approved()->create([
        'pre_order_deadline' => now()->subYear()->toDateString(),
    ]);

    expect($product->preOrderStatus())->toBeNull()
        ->and(PreOrderRules::isValid($product, 1))->toBeTrue();
});

test('minimum quantity ignored when null', function () {
    $product = Product::factory()->approved()->preOrder()->create([
        'pre_order_min_quantity' => null,
        'pre_order_deadline' => now()->addDay()->toDateString(),
    ]);

    expect(PreOrderRules::isBelowMinimumQuantity($product, 1))->toBeFalse()
        ->and(PreOrderRules::isValid($product, 1))->toBeTrue();
});

test('ready stock products skip pre order rules', function () {
    $product = Product::factory()->approved()->create([
        'pre_order_deadline' => now()->subYear()->toDateString(),
        'pre_order_min_quantity' => 100,
    ]);

    expect(PreOrderRules::isValid($product, 1))->toBeTrue()
        ->and(PreOrderRules::invalidReasons($product, 1))->toBe([]);
});

test('shared fulfillment helper never advances pre order to packed', function () {
    $item = new OrderItem([
        'is_pre_order' => true,
        'status' => OrderItemStatus::Pending,
        'payment_status' => PaymentStatus::Paid,
    ]);

    expect(OrderItemFulfillment::expectedNext($item))->toBe(OrderItemStatus::InProduction)
        ->and(OrderItemFulfillment::allowedFulfillmentStatusValues(true))
        ->not->toContain(OrderItemStatus::Packed->value);
});
