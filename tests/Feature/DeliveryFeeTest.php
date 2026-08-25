<?php

use App\Enums\PaymentStatus;
use App\Enums\ProductSalesMethod;
use App\Enums\StockMovementSource;
use App\Enums\UserRole;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\UpJurusan;
use App\Models\UpJurusanStockMovement;
use App\Models\User;
use App\Support\DeliveryFeeService;
use App\Support\DeliveryFeeSettings;
use App\Support\PaymentTransitionService;
use App\Support\ReportAggregationService;

test('delivery checkout stores fee of the matching tier while pickup does not', function () {
    DeliveryFeeSettings::updateTiers([
        ['min_spend' => 0, 'fee' => 3000],
        ['min_spend' => 25000, 'fee' => 2000],
        ['min_spend' => 50000, 'fee' => 0],
    ]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->approved()->create(['price' => 10000, 'stock' => 12]);

    // Subtotal 20.000 falls into the base tier.
    CartItem::query()->create([
        'user_id' => $buyer->id,
        'product_id' => $product->id,
        'quantity' => 2,
    ]);

    $this->actingAs($buyer)
        ->post(route('checkout'), [
            'pickup_method' => 'delivery',
            'pickup_location' => 'Depan kelas XI RPL 1.',
        ]);

    $this->assertDatabaseHas('orders', [
        'user_id' => $buyer->id,
        'pickup_method' => 'delivery',
        'total_price' => 23000,
        'delivery_fee' => 3000,
        'delivery_fee_min_spend' => 0,
    ]);

    // Subtotal 30.000 reaches the second tier.
    CartItem::query()->create([
        'user_id' => $buyer->id,
        'product_id' => $product->id,
        'quantity' => 3,
    ]);

    $this->actingAs($buyer)
        ->post(route('checkout'), [
            'pickup_method' => 'delivery',
            'pickup_location' => 'Meja piket.',
        ]);

    $this->assertDatabaseHas('orders', [
        'user_id' => $buyer->id,
        'delivery_fee' => 2000,
        'delivery_fee_min_spend' => 25000,
    ]);

    CartItem::query()->create([
        'user_id' => $buyer->id,
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    // Pickup orders are never charged.
    $this->actingAs($buyer)
        ->post(route('checkout'), [
            'pickup_method' => 'pickup',
        ]);

    $this->assertDatabaseHas('orders', [
        'user_id' => $buyer->id,
        'pickup_method' => 'pickup',
        'total_price' => 10000,
        'delivery_fee' => 0,
        'delivery_fee_min_spend' => null,
    ]);
});

test('changing tiers does not affect orders already created', function () {
    DeliveryFeeSettings::updateTiers([
        ['min_spend' => 0, 'fee' => 3000],
        ['min_spend' => 25000, 'fee' => 2000],
    ]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->approved()->create(['price' => 5000, 'stock' => 9]);

    CartItem::query()->create([
        'user_id' => $buyer->id,
        'product_id' => $product->id,
        'quantity' => 6,
    ]);

    $this->actingAs($buyer)
        ->post(route('checkout'), [
            'pickup_method' => 'delivery',
            'pickup_location' => 'Meja piket.',
        ]);

    DeliveryFeeSettings::updateTiers([['min_spend' => 0, 'fee' => 9000]]);

    $order = Order::query()->where('user_id', $buyer->id)->first();

    expect($order->delivery_fee)->toBe(2000)
        ->and($order->delivery_fee_min_spend)->toBe(25000);
});

test('paying every item records proportional delivery fee per up jurusan once', function () {
    DeliveryFeeSettings::updateTiers([['min_spend' => 0, 'fee' => 7000]]);
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $upA = UpJurusan::factory()->create();
    $upB = UpJurusan::factory()->create();

    $productA = Product::factory()->approved()->create([
        'seller_id' => null,
        'up_jurusan_id' => $upA->id,
        'sales_method' => ProductSalesMethod::UpJurusan,
        'price' => 30000,
        'stock' => 2,
    ]);
    $productB = Product::factory()->approved()->create([
        'seller_id' => null,
        'up_jurusan_id' => $upB->id,
        'sales_method' => ProductSalesMethod::UpJurusan,
        'price' => 10000,
        'stock' => 1,
    ]);

    $order = Order::factory()->create([
        'user_id' => User::factory()->create(['role' => UserRole::Buyer])->id,
        'pickup_method' => 'delivery',
        'total_price' => 77000,
        'delivery_fee' => 7000,
        'delivery_fee_min_spend' => 0,
    ]);

    $itemA = OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $productA->id,
        'price' => 30000,
        'quantity' => 2,
        'subtotal' => 60000,
    ]);
    $itemB = OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $productB->id,
        'price' => 10000,
        'quantity' => 1,
        'subtotal' => 10000,
    ]);

    PaymentTransitionService::approve($itemA, $admin);

    // Only one item paid so far: the order is not fully paid yet.
    expect(UpJurusanStockMovement::query()
        ->where('source', StockMovementSource::DeliveryFee->value)
        ->count())->toBe(0);

    $itemA->refresh();
    $itemB->refresh();
    PaymentTransitionService::approve($itemB, $admin);

    $feeMovements = UpJurusanStockMovement::query()
        ->where('order_id', $order->id)
        ->where('source', StockMovementSource::DeliveryFee->value)
        ->where('type', 'out')
        ->get()
        ->keyBy('up_jurusan_id');

    expect($feeMovements)->toHaveCount(2)
        ->and((int) $feeMovements[$upA->id]->gross_amount)->toBe(6000)
        ->and((int) $feeMovements[$upB->id]->gross_amount)->toBe(1000)
        ->and((int) $feeMovements[$upA->id]->seller_amount)->toBe(0)
        ->and((int) $feeMovements->sum('gross_amount'))->toBe(7000);

    // Idempotent: recording again must not duplicate movements.
    $order->refresh();
    DeliveryFeeService::recordForOrder($order, $admin);

    expect(UpJurusanStockMovement::query()
        ->where('order_id', $order->id)
        ->where('source', StockMovementSource::DeliveryFee->value)
        ->count())->toBe(2);

    // UP revenue totals include the recorded fee.
    expect(ReportAggregationService::upRevenueTotal($upA->id, now()->subDay()))->toBe(6000)
        ->and(ReportAggregationService::upRevenueTotal($upB->id, now()->subDay()))->toBe(1000);
});

test('rejecting payment never records a delivery fee movement', function () {
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $product = Product::factory()->for($seller, 'seller')->approved()->create([
        'price' => 20000,
        'stock' => 3,
    ]);
    $order = Order::factory()->create([
        'pickup_method' => 'delivery',
        'delivery_fee' => 3000,
        'delivery_fee_min_spend' => 0,
    ]);
    $item = OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'quantity' => 1,
        'price' => 20000,
        'subtotal' => 20000,
    ]);

    PaymentTransitionService::reject($item, $seller, 'Stok habis.');

    expect(UpJurusanStockMovement::query()
        ->where('source', StockMovementSource::DeliveryFee->value)
        ->where('order_id', $order->id)
        ->count())->toBe(0);
});

test('recorded delivery fee movements can be reversed idempotently', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $upJurusan = UpJurusan::factory()->create();
    $order = Order::factory()->create([
        'pickup_method' => 'delivery',
        'payment_status' => PaymentStatus::Paid,
        'delivery_fee' => 5000,
        'delivery_fee_min_spend' => 0,
    ]);

    UpJurusanStockMovement::query()->create([
        'up_jurusan_consignment_id' => null,
        'up_jurusan_id' => $upJurusan->id,
        'product_id' => null,
        'order_id' => $order->id,
        'user_id' => $admin->id,
        'type' => 'out',
        'source' => StockMovementSource::DeliveryFee,
        'quantity' => 0,
        'unit_price' => 5000,
        'gross_amount' => 5000,
        'commission_amount' => 5000,
        'seller_amount' => 0,
        'note' => 'Biaya antar pesanan',
    ]);

    // Paid items are final per business rules, so reversal is exercised via
    // the service directly (it stays as a safety net in cancellation flows).
    DeliveryFeeService::reverseForOrder($order, $admin);

    $feeOut = UpJurusanStockMovement::query()
        ->where('order_id', $order->id)
        ->where('source', StockMovementSource::DeliveryFee->value)
        ->where('type', 'out')
        ->first();

    expect(UpJurusanStockMovement::query()
        ->where('reverses_movement_id', $feeOut->id)
        ->where('type', 'in')
        ->exists())->toBeTrue()
        ->and((int) UpJurusanStockMovement::query()
            ->where('reverses_movement_id', $feeOut->id)
            ->sum('gross_amount'))->toBe(5000);

    // Idempotent: reversing again must not duplicate the reversal row.
    DeliveryFeeService::reverseForOrder($order, $admin);

    expect(UpJurusanStockMovement::query()
        ->where('reverses_movement_id', $feeOut->id)
        ->count())->toBe(1);
});

test('admin can save tier rules and they are normalized on read', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($admin)
        ->get(route('admin.settings.delivery-fee.edit'))
        ->assertOk();

    $this->actingAs($admin)
        ->put(route('admin.settings.delivery-fee.update'), [
            'tiers' => [
                ['min_spend' => 50000, 'fee' => 0],
                ['min_spend' => 25000, 'fee' => 2000],
                ['min_spend' => 0, 'fee' => 3000],
            ],
        ])
        ->assertRedirect(route('admin.settings.delivery-fee.edit'));

    expect(DeliveryFeeSettings::tiers())->toBe([
        ['min_spend' => 0, 'fee' => 3000],
        ['min_spend' => 25000, 'fee' => 2000],
        ['min_spend' => 50000, 'fee' => 0],
    ])
        ->and(DeliveryFeeService::feeForSubtotal(10000))->toBe(3000)
        ->and(DeliveryFeeService::feeForSubtotal(25000))->toBe(2000)
        ->and(DeliveryFeeService::feeForSubtotal(99000))->toBe(0);
});

test('tier rules require a base rule at zero and unique minimums', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($admin)
        ->from(route('admin.settings.delivery-fee.edit'))
        ->put(route('admin.settings.delivery-fee.update'), [
            'tiers' => [
                ['min_spend' => 10000, 'fee' => 3000],
            ],
        ])
        ->assertRedirect(route('admin.settings.delivery-fee.edit'))
        ->assertSessionHasErrors('tiers');

    $this->actingAs($admin)
        ->from(route('admin.settings.delivery-fee.edit'))
        ->put(route('admin.settings.delivery-fee.update'), [
            'tiers' => [
                ['min_spend' => 0, 'fee' => 3000],
                ['min_spend' => 10000, 'fee' => 2000],
                ['min_spend' => 10000, 'fee' => 1000],
            ],
        ])
        ->assertRedirect(route('admin.settings.delivery-fee.edit'))
        ->assertSessionHasErrors('tiers');

    $this->actingAs($admin)
        ->from(route('admin.settings.delivery-fee.edit'))
        ->put(route('admin.settings.delivery-fee.update'), [
            'tiers' => [
                ['min_spend' => 0, 'fee' => -5],
            ],
        ])
        ->assertRedirect(route('admin.settings.delivery-fee.edit'))
        ->assertSessionHasErrors('tiers.0.fee');

    // Nothing was persisted by the rejected submissions.
    expect(DeliveryFeeSettings::tiers())->toBe([
        ['min_spend' => 0, 'fee' => 0],
    ]);
});

test('only admin may open or update delivery fee settings', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);

    $this->actingAs($buyer)
        ->get(route('admin.settings.delivery-fee.edit'))
        ->assertForbidden();

    $this->actingAs($buyer)
        ->put(route('admin.settings.delivery-fee.update'), [
            'tiers' => [['min_spend' => 0, 'fee' => 5000]],
        ])
        ->assertForbidden();

    expect(DeliveryFeeSettings::tiers())->toBe([
        ['min_spend' => 0, 'fee' => 0],
    ]);
});
